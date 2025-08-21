from pyrad import dictionary, packet, server
from models.clients import Client
from models.radius_session import RadiusSession
from app import db
from datetime import datetime
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def _get_mikrotik_rate_limit(bandwidth_mbps):
    """Converts bandwidth in Mbps to Mikrotik-Rate-Limit string (e.g., "1M/1M")."""
    if bandwidth_mbps:
        return f"{bandwidth_mbps}M/{bandwidth_mbps}M"
    return None

class RadiusServer(server.Server):
    def __init__(self, dictionary_file=None):
        if dictionary_file is None:
            dictionary_file = "/etc/freeradius/3.0/dictionary"
        
        self.dictionary = dictionary.Dictionary(dictionary_file)
        # Attempt to load Mikrotik dictionary
        try:
            self.dictionary.read_dictionary("/etc/freeradius/3.0/dictionary.mikrotik")
            logger.info("Loaded Mikrotik RADIUS dictionary.")
        except IOError:
            logger.warning("Mikrotik RADIUS dictionary not found at /etc/freeradius/3.0/dictionary.mikrotik. Mikrotik-specific attributes may not work.")

        server.Server.__init__(self, dict=self.dictionary)
        
        # RADIUS secret key - should be configured securely in production
        self.secret = b"your_secret_key"
        
    def HandleAuthPacket(self, pkt):
        """Handle incoming authentication requests"""
        username = pkt.get(1)[0]  # Username attribute
        password = pkt.get(2)[0]  # Password attribute
        
        logger.info(f"Auth request for user: {username}")
        
        # Look up client in database
        client = Client.query.filter_by(username=username).first()
        
        reply = self.CreateReplyPacket(pkt)
        
        if not client or not client.active:
            logger.warning(f"Auth failed: User {username} not found or inactive")
            reply.code = packet.AccessReject
            return reply
            
        if client.balance <= 0:
            logger.warning(f"Auth failed: Insufficient balance for user {username}")
            reply.code = packet.AccessReject
            return reply
            
        # Update last login time
        client.last_login = datetime.utcnow()
        db.session.commit()
        
        # Authentication successful
        reply.code = packet.AccessAccept
        
        # Add RADIUS attributes for connection parameters
        if client.bandwidth_limit:
            mikrotik_rate_limit = _get_mikrotik_rate_limit(client.bandwidth_limit)
            if mikrotik_rate_limit:
                reply.AddAttribute("Mikrotik-Rate-Limit", mikrotik_rate_limit)
            reply.AddAttribute("Acct-Interim-Interval", 300)  # Update every 5 minutes
            
        if client.session_timeout:
            reply.AddAttribute("Session-Timeout", client.session_timeout)
            
        if client.ip_address:
            reply.AddAttribute("Framed-IP-Address", client.ip_address)
            
        logger.info(f"Auth successful for user: {username}")
        return reply

    def HandleAcctPacket(self, pkt):
        """Handle incoming accounting requests"""
        username = pkt.get(1)[0]  # User-Name
        acct_status_type = pkt.get(40)[0]  # Acct-Status-Type

        logger.info(f"Accounting request for user: {username}, Type: {acct_status_type}")

        # Extract relevant accounting attributes
        acct_session_id = pkt.get(44, [None])[0]  # Acct-Session-Id
        acct_input_octets = pkt.get(42, [0])[0]  # Acct-Input-Octets
        acct_output_octets = pkt.get(43, [0])[0]  # Acct-Output-Octets
        acct_session_time = pkt.get(46, [0])[0]  # Acct-Session-Time
        
        if acct_status_type == b"Start":
            session = RadiusSession(
                session_id=acct_session_id.decode('utf-8'),
                username=username.decode('utf-8'),
                start_time=datetime.utcnow()
            )
            db.session.add(session)
            db.session.commit()
            logger.info(f"  New session started: {acct_session_id}")
        elif acct_status_type == b"Stop" or acct_status_type == b"Interim-Update":
            session = RadiusSession.query.filter_by(session_id=acct_session_id.decode('utf-8')).first()
            if session:
                session.input_octets = acct_input_octets
                session.output_octets = acct_output_octets
                session.session_time = acct_session_time
                if acct_status_type == b"Stop":
                    session.stop_time = datetime.utcnow()
                db.session.commit()
                logger.info(f"  Session {acct_status_type.decode('utf-8')} for {acct_session_id}")
            else:
                logger.warning(f"  Session not found for {acct_status_type.decode('utf-8')}: {acct_session_id}")

        reply = self.CreateReplyPacket(pkt)
        reply.code = packet.AccountingResponse
        return reply

def start_radius_server(host="0.0.0.0", auth_port=1812, acct_port=1813):
    """Start the RADIUS server"""
    logger.info("Starting RADIUS server...")
    
    # Create and start server
    srv = RadiusServer()
    srv.BindToAddress(host, auth_port) # Bind to authentication port
    srv.BindToAddress(host, acct_port) # Bind to accounting port
    srv.Run()

# Usage example:
if __name__ == "__main__":
    start_radius_server()