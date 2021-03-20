const { Telegraf } = require('telegraf')
const token = '1731816120:AAE5UVzQb_KLw1oe_COPdkHnHG2hBJ7e2Xc';
const db = require('better-sqlite3')('TravelBot.db');
const express = require('express')
const { MenuTemplate, MenuMiddleware } = require('telegraf-inline-menu')
const bot = new Telegraf(token);

bot.start((ctx) => {
    console.log(ctx.from);
    console.log(ctx.chat);
    console.log(ctx.message);
    if (ctx.from.first_name && ctx.from.last_name)
        ctx.reply('Welcome ' + ctx.from.first_name + ' ' + ctx.from.last_name + ' on TravelBot');
    else if (ctx.from.first_name)
        ctx.reply('Welcome ' + ctx.from.first_name + ' on TravelBot');
    else if (ctx.from.last_name)
        ctx.reply('Welcome ' + ctx.from.last_name + ' on TravelBot');
});

bot.command('winform', (ctx) => {
    ctx.reply('Prof mi metta 10 sulla fiducia')
});


bot.launch();