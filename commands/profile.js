const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('canvas');
const { MessageAttachment } = require('discord.js');
const sequelize = require('../sequelize');

const Users = sequelize.model('user');

const createCanvas = async (member) => {
	const canvas = Canvas.createCanvas(700, 250);
	const context = canvas.getContext('2d');
	const background = await Canvas.loadImage('./wallpaper.jpg');
	const { count } = await Users.findOne({ where: { id: member.id } });

	context.drawImage(background, 0, 0, canvas.width, canvas.height);

	applyDarkFilter(canvas, context);

	const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));

	writeText(canvas, `${count} quoi`, 35, canvas.width / 2.5, canvas.height / 1.4);
	writeText(canvas, member.displayName, 70, canvas.width / 2.5, canvas.height / 1.8);

	drawRoundImage(context, avatar);

	return canvas;
};

const applyDarkFilter = (canvas, ctx) => {
	ctx.rect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
	ctx.fill();
};

const drawRoundImage = (ctx, image) => {
	ctx.beginPath();
	ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
	ctx.closePath();
	ctx.clip();
	ctx.drawImage(image, 25, 25, 200, 200);
};

const writeText = (canvas, content, size, x, y) => {
	const ctx = canvas.getContext('2d');

	applyText(canvas, content, size);
	ctx.fillStyle = '#ffffff';
	ctx.fillText(content, x, y);
};

const applyText = (canvas, text, size) => {
	const context = canvas.getContext('2d');

	// Declare a base size of the font
	let fontSize = size;

	do {
		// Assign the font to the context and decrement it so it can be measured again
		context.font = `${fontSize -= 10}px sans-serif`;
		// Compare pixel width of the text to the canvas minus the approximate avatar size
	} while (context.measureText(text).width > canvas.width - 300);

	// Return the result to use in the actual canvas
	return context.font;
};


module.exports = {
	data: new SlashCommandBuilder()
		.setName('profile')
		.setDescription('Montre le deep profil discord'),
	async execute(interaction) {

		const { member } = interaction;

		const canvas = await createCanvas(member);

		const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');

		interaction.reply({ files: [attachment] });
	},
};

