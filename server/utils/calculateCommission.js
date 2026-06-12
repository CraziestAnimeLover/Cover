const calculateCommission = (amount, percentage) => {
  return (amount * percentage) / 100;
};

const getAgentCommissionRate = (agentLevel) => {
  const rates = {
    bronze: 10,   // 10%
    silver: 15,   // 15%
    gold: 20,     // 20%
    platinum: 25, // 25%
  };
  return rates[agentLevel] || 10;
};

module.exports = { calculateCommission, getAgentCommissionRate };