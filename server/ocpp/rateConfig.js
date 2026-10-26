let ratePerKwh = 10; // default ₹10/kWh

export const getRate = () => ratePerKwh;
export const setRate = (val) => { ratePerKwh = val; };
