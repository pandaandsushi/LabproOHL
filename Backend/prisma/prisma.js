const { PrismaClient } = require('@prisma/client');
class PrismaSingleton {
  constructor() {
    if (!PrismaSingleton.instance) {
      PrismaSingleton.instance = new PrismaClient();
    }
  }
  getInstance() {
    return PrismaSingleton.instance;
  }
}

const instance = new PrismaSingleton();
Object.freeze(instance);

module.exports = instance;
