import sequelize from './db';
import Claim from '../models/Claim';
import DirectoryEntry from '../models/DirectoryEntry';

let initialized = false;

function setupAssociations(): void {
  if (!DirectoryEntry.associations.claims) {
    DirectoryEntry.hasMany(Claim, {
      foreignKey: 'directoryEntryId',
      as: 'claims',
    });
  }

  if (!Claim.associations.directoryEntry) {
    Claim.belongsTo(DirectoryEntry, {
      foreignKey: 'directoryEntryId',
      as: 'directoryEntry',
    });
  }
}

export async function initDb(): Promise<void> {
  if (initialized) {
    return;
  }

  setupAssociations();
  await sequelize.sync();
  initialized = true;
}

export { sequelize, Claim, DirectoryEntry };
