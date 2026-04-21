// Data service layer (prepares app for API integration)
const DataService = {
  loadInitialData() {
    return {
      materials: [...window.MATERIALS],
      equipment: [...window.EQUIPMENT],
      suppliers: [...window.SUPPLIERS],
      movements: [...window.MOVEMENTS],
    };
  },
};

Object.assign(window, { DataService });
