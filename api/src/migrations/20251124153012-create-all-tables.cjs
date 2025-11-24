'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Créer la table user
    await queryInterface.createTable('user', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      pseudo: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      role: {
        type: Sequelize.STRING(255),
        allowNull: false,
        defaultValue: 'USER'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // 2. Créer la table account
    await queryInterface.createTable('account', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // 3. Créer la table budget
    await queryInterface.createTable('budget', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'user',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      limit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      date: {
        type: Sequelize.CHAR(7), // YYYY-MM
        allowNull: false
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'account',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // 4. Créer la table detail_account
    await queryInterface.createTable('detail_account', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      date: {
        type: Sequelize.CHAR(10), // YYYY-MM-DD
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      type: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'account',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // 5. Créer la table detail_budget
    await queryInterface.createTable('detail_budget', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      date: {
        type: Sequelize.CHAR(7), // YYYY-MM
        allowNull: false
      },
      budget_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'budget',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // 6. Ajouter des index pour optimiser les performances
    await queryInterface.addIndex('account', ['user_id']);
    await queryInterface.addIndex('budget', ['user_id']);
    await queryInterface.addIndex('budget', ['account_id']);
    await queryInterface.addIndex('detail_account', ['account_id']);
    await queryInterface.addIndex('detail_budget', ['budget_id']);
  },

  async down(queryInterface, Sequelize) {
    // Supprimer les tables dans l'ordre inverse (à cause des clés étrangères)
    await queryInterface.dropTable('detail_budget');
    await queryInterface.dropTable('detail_account');
    await queryInterface.dropTable('budget');
    await queryInterface.dropTable('account');
    await queryInterface.dropTable('user');
  }
};