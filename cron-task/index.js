const schedule = require('node-schedule');
const sequelize = require('../sequelize');

// const agenda = new Agenda();
const Users = sequelize.model('user');

const resetAttempsJob = schedule.scheduleJob('0 0 */1 * *', async () => {
	await Users.update({ attemps: 3 }, { where: {} });
});

resetAttempsJob.on('success', () => { console.log(`🃏 Cards has been reset at ${new Date().toLocaleString()}`); });

resetAttempsJob.on('error', (err) => { console.error(err); });


// agenda.define('resetAttemps', async (job) => {

// });

// agenda.define('task', async (job) => {
// 	await console.log('task');
// });

// agenda.processEvery('1 second');

// module.exports = agenda;