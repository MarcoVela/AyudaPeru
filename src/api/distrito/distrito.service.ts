import { Inject, Injectable } from '@nestjs/common';
import { sequelizeToken } from '../../constants';
import { Sequelize } from 'sequelize-typescript';
import { Distrito } from '../../database/schema/Distrito.model';

@Injectable()
export class DistritoService {
  public readonly notFoundError: Error;
  constructor(@Inject(sequelizeToken) private readonly sequelize: Sequelize) {
    this.notFoundError = new Error("Distrito not found.");
  }

  async findAll(): Promise<number[]> {
    return (await Distrito.findAll({ attributes: ['id'] })).map(code => code.get('id'));
  }

  findById(id: number): Promise<Distrito> {
    return Distrito.findByPk(id, { rejectOnEmpty: this.notFoundError });
  }

  async findByLatLong(latitude: number, longitude: number): Promise<Distrito> {
    return this.sequelize.transaction(async transaction => {
      await this.sequelize.query(`SET @point=ST_POINTFROMTEXT('POINT(? ?)')`,
        { replacements: [longitude, latitude], transaction }
      );

      const codigo: Distrito = await Distrito.findOne({
        where: Sequelize.literal(`ST_WITHIN(@point, geometria)`),
        rejectOnEmpty: this.notFoundError,
        transaction
      });
      await this.sequelize.query(`SET @point=NULL`, { transaction });
      return codigo;
    });
  }
}
