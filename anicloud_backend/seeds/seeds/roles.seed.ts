import type { DataSource } from 'typeorm';
import { Role } from '../../src/roles/entities/role.entity';
import { RoleName } from '../../src/roles/entities/role.interface';

/**
 * Filling table Roles in the database based on the RoleName list(enum)
 *
 * @param dataSource -Active  `DataSource` TypeORM instance for accessing the `Role` repository
 *
 *
 */
export async function seedRoles(dataSource: DataSource): Promise<void> {
  const roleRepository = dataSource.getRepository(Role);
  const roleNames = Object.values(RoleName);

  for (const name of roleNames) {
    const existingRole = await roleRepository.findOne({
      where: { name },
    });

    if (!existingRole) {
      const role = roleRepository.create({ name });
      await roleRepository.save(role);
      console.log(`Role "${name}" created.`);
    } else {
      console.log(`Role "${name}" already exists.`);
    }
  }
}
