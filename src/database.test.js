const db = require('./database');

// Increase timeout for database operations
jest.setTimeout(10000);

beforeAll(async () => {
    try {
        await db.sequelize.sync({ force: true });
    } catch (error) {
        console.error('Error in beforeAll:', error);
        throw error;
    }
});

test('create person', async () => {
    expect.assertions(1);
    try {
        const person = await db.Person.create({
            id: 1,
            firstName: 'Bobbie',
            lastName: 'Draper'
        });
        expect(person.id).toEqual(1);
    } catch (error) {
        console.error('Error in create person test:', error);
        throw error;
    }
});

test('get person', async () => {
    expect.assertions(2);
    try {
        const person = await db.Person.findByPk(1);
        expect(person.firstName).toEqual('Bobbie');
        expect(person.lastName).toEqual('Draper');
    } catch (error) {
        console.error('Error in get person test:', error);
        throw error;
    }
});

test('delete person', async () => {
    expect.assertions(1);
    try {
        await db.Person.destroy({
            where: {
                id: 1
            }
        });
        const person = await db.Person.findByPk(1);
        expect(person).toBeNull();
    } catch (error) {
        console.error('Error in delete person test:', error);
        throw error;
    }
});

afterAll(async () => {
    try {
        await db.sequelize.close();
    } catch (error) {
        console.error('Error in afterAll:', error);
        throw error;
    }
});