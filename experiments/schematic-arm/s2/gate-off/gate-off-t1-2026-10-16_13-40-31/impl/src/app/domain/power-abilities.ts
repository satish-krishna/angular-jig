import type { PowerClass } from './hero.model';

/** Signature abilities per power class. EXAMPLE DATA. */
export const POWER_ABILITIES: Record<PowerClass, readonly string[]> = {
  Aerial: ['Flight', 'Wind shear', 'Sonic dive'],
  Energy: ['Plasma bolt', 'Surge shield', 'Overcharge'],
  Psionic: ['Telepathy', 'Mind shield', 'Telekinesis'],
  Tech: ['Drone swarm', 'System hack', 'Field armour'],
  Mutant: ['Regeneration', 'Adaptive hide', 'Pheromone'],
  Cosmic: ['Gravity well', 'Starlight', 'Void step'],
  Enhanced: ['Super strength', 'Durability', 'Reflexes'],
};
