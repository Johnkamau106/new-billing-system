from pyrad import dictionary, packet, server
from models.clients import Client
from app import db
from datetime import datetime
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RadiusServer(server.Server):
    def __init__(self, dictionary_file=None):
        if dictionary_file is None:
            dictionary_file = "/etc/freeradius/3.0/dictionary"
        
        self.dictionary = dictionary.Dictionary(dictionary_file)
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
            reply.AddAttribute("Acct-Interim-Interval", 300)  # Update every 5 minutes
            reply.AddAttribute("WISPr-Bandwidth-Max-Up", client.bandwidth_limit)
            reply.AddAttribute("WISPr-Bandwidth-Max-Down", client.bandwidth_limit)
            
        if client.session_timeout:
            reply.AddAttribute("Session-Timeout", client.session_timeout)
            
        if client.ip_address:
            reply.AddAttribute("Framed-IP-Address", client.ip_address)
            
        logger.info(f"Auth successful for user: {username}")
        return reply

def start_radius_server(host="0.0.0.0", auth_port=1812, acct_port=1813):
    """Start the RADIUS server"""
    logger.info("Starting RADIUS server...")
    
    # Create and start server
    srv = RadiusServer()
    srv.BindToAddress(host)
    srv.Run()

# Usage example:
if __name__ == "__main__":
    start_radius_server()
