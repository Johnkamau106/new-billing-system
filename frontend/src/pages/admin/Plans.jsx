import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlanModal } from '../../components/PlanModal';
import './Plans.css';

const Plans = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const queryClient = useQueryClient();

  const { data: plans, isLoading } = useQuery(
    ['plans'],
    () => fetch('/api/plans').then(res => res.json())
  );

  const addPlanMutation = useMutation(
    (planData) => fetch('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData),
    }).then(res => res.json()),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('plans');
        setShowAddModal(false);
      },
    }
  );

  const togglePlanMutation = useMutation(
    ({ planId, active }) => fetch(`/api/plans/${planId}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    }).then(res => res.json()),
    {
      onSuccess: () => queryClient.invalidateQueries('plans'),
    }
  );

  const handleAddPlan = (planData) => {
    addPlanMutation.mutate({
      ...planData,
      isActive: true,
    });
  };

  return (
    <div className="plans">
      <div className="plans__header">
        <h1 className="plans__title">Internet Plans</h1>
        <button 
          className="plans__add"
          onClick={() => setShowAddModal(true)}
        >
          Add New Plan
        </button>
      </div>

      {isLoading ? (
        <div className="plans__loading">Loading...</div>
      ) : (
        <div className="plans__grid">
          {plans?.map((plan) => (
            <div key={plan.id} className="plan-card">
              <div className="plan-card__header">
                <h3 className="plan-card__title">{plan.name}</h3>
                <span className={`plan-card__type plan-card__type--${plan.type}`}>
                  {plan.type}
                </span>
              </div>
              
              <div className="plan-card__price">
                KES {plan.price.toLocaleString()}
                <span className="plan-card__period">/{plan.billingPeriod} days</span>
              </div>

              <div className="plan-card__speeds">
                <div className="speed-item">
                  <span className="speed-label">Download</span>
                  <span className="speed-value">{plan.speedDown} Mbps</span>
                </div>
                <div className="speed-item">
                  <span className="speed-label">Upload</span>
                  <span className="speed-value">{plan.speedUp} Mbps</span>
                </div>
              </div>

              <ul className="plan-card__features">
                <li>
                  <span className="feature-label">Grace Period:</span>
                  <span className="feature-value">{plan.gracePeriod} days</span>
                </li>
                <li>
                  <span className="feature-label">FUP Policy:</span>
                  <span className="feature-value">{plan.fupPolicy || 'None'}</span>
                </li>
                {plan.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>

              <div className="plan-card__actions">
                <button
                  className="action-btn"
                  onClick={() => setSelectedPlan(plan)}
                >
                  Edit
                </button>
                <button
                  className={`action-btn ${plan.isActive ? 'action-btn--danger' : 'action-btn--success'}`}
                  onClick={() => togglePlanMutation.mutate({ 
                    planId: plan.id, 
                    active: !plan.isActive 
                  })}
                >
                  {plan.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <PlanModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddPlan}
        />
      )}

      {selectedPlan && (
        <PlanModal
          plan={selectedPlan}
          onClose={() => setSelectedPlan(null)}
          onSubmit={(data) => {
            // Handle edit plan
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
};

export default Plans;
