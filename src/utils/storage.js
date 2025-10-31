// Wrapper para el Storage API de Claude Artifacts
const storage = {
  async get(key) {
    try {
      const result = await window.storage.get(key);
      return result ? result.value : null;
    } catch (error) {
      console.error(`Error al obtener ${key}:`, error);
      return null;
    }
  },

  async set(key, value) {
    try {
      const result = await window.storage.set(key, value);
      return result !== null;
    } catch (error) {
      console.error(`Error al guardar ${key}:`, error);
      throw error;
    }
  },

  async delete(key) {
    try {
      const result = await window.storage.delete(key);
      return result !== null;
    } catch (error) {
      console.error(`Error al eliminar ${key}:`, error);
      return false;
    }
  }
};

export default storage;