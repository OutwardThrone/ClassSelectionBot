// imports
const Discord = require('discord.js');
const moment = require('moment');
const courses = require('./exampleCourses.json');
const config = require('./exampleConfig.json');

// client initialization
const bot = new Discord.Client();

// set up server and channel id's
const serverID = config.serverID;
const logChannelID = config.logChannelID;
const reactionChannelID = config.reactionChannelID
const reactLogChannelID = config.reactLogChannelID

// collection of many emojis
const allEmojis = ['🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭', '🇮', '🇯', '🇰', '🇱', '🇲', '🇳', '🇴', '🇵', '🇶', '🇷', '🇸', '🇹', '🇺', '🇻', '🇼', '🇽', '🇾', '🇿',
    '\u0030\u20E3', '\u0031\u20E3', '\u0032\u20E3', '\u0033\u20E3', '\u0034\u20E3', '\u0035\u20E3', '\u0036\u20E3', '\u0037\u20E3', '\u0038\u20E3', '\u0039\u20E3',
    '🙌', '👏', '🤝', '👍', '👎', '👊', '✊', '✌', '🤘', '👌', '👈', '👉', '👆', '👇', '☝', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '🖕', '✍', '🙏',
    '🙌🏼', '👏🏼', '🙏🏼', '👍🏼', '👎🏼', '👊🏼', '✊🏼', '🤛🏼', '🤜🏼', '🤞🏼', '✌🏼', '🤘🏼', '👌🏼', '👈🏼', '👉🏼', '👆🏼', '👇🏼', '☝🏼', '✋🏼', '🤚🏼', '🖐🏼', '🖖🏼', '👋🏼', '🤙🏼', '💪🏼', '🖕🏼', '✍🏼'];
let emojiToRoleID = {};
let emojiToRoleName = {};

bot.on('ready', () => {
    // initialization message
    let now = new moment().format('MMMM Do YYYY, h:mm:ss a');
    console.log(`Ready: ${now}`);
    bot.guilds.get(serverID).channels.get(logChannelID).send(`Ready: ${now}`);
    
    // set up the reaction list
    setUpReactions();
});

async function setUpReactions() {
    //clearing react channel
    bot.guilds.get(serverID).channels.get(reactionChannelID).fetchMessages().then(result => {
        for (const m of result) {
            m[1].delete();
        }
    });

    //setting up reaction channel and sending the messages and reacting once
    let instuctionMessage = new Discord.RichEmbed().setColor('RANDOM').setTitle("GET YER CLASSES AND TEACHERS")
        .setDescription(`React to the corresponding emojis to get the roles for your classes/teachers. 
     Make sure you look closely to what you're reacting to they don't always match up. 
     You can unreact to remove an incorrect role. 
     The #log channel will have all the roles given and taken from you.
     So when you react to something make sure you check that channel to see if you got the roles.
     Let Vibhav or Kush know if there are any errors or if you think a class/teacher is missing.
     Also if I (God's Helper) am not online, you can't get roles. Contact Vibhav or Kush if that happens.`);
    bot.guilds.get(serverID).channels.get(reactionChannelID).send(instuctionMessage);

    //walks throught all the classes in courses file and adds it to a rich embed message
    //dictionaries are for refference when reacting
    let count = 0;
    let prevcount = 0;
    
    for (let subject in courses) {
        let subjMessage = new Discord.RichEmbed().setColor('RANDOM').setTitle(subject.toUpperCase());
        for (let indvClass in courses[subject]) {
            subjMessage.addField(`${indvClass}:`, `${allEmojis[count]}`);
            emojiToRoleID[allEmojis[count]] = courses[subject][indvClass];
            emojiToRoleName[allEmojis[count]] = indvClass;
            count++;
        }
        const embedMessage = await bot.guilds.get(serverID).channels.get(reactionChannelID).send(subjMessage);
        for (let i = prevcount; i < count; i++) {
            await embedMessage.react(allEmojis[i]);
        }
        prevcount = count;
    }
}

bot.on('messageReactionAdd', (messageReaction, user) => {
    if (user.id != bot.user.id) {
        //not the bot
        if (messageReaction.message.channel.id === reactionChannelID) {
            //in the react channel

            //console.log(`reaction ${messageReaction.emoji.toString()} by ${user.username}`);
            //messageReaction.message.channel.send(`reaction ${messageReaction.emoji.toString()} by ${user.username}`);
            for (let letter in allEmojis) {
                if (allEmojis[letter] === messageReaction.emoji.toString()) {
                    //one of the emojis
                    //and found the emoji

                    //console.log("in all leters");
                    //messageReaction.message.channel.send(`I would give you this role id: ${letToID[allLetters[letter]]}`);
                    let roleID = emojiToRoleID[allEmojis[letter]];
                    if (!bot.guilds.get(serverID).members.get(user.id).roles.has(roleID)) {
                        //doesn't already have the role
                        bot.guilds.get(serverID).members.get(user.id).addRole(roleID);
                        //messageReaction.message.channel.send(`<@!${user.id}> gave you ${letToName[allLetters[letter]]}`);
                        bot.guilds.get(serverID).channels.get(reactLogChannelID).send(`<@!${user.id}> gave you ${emojiToRoleName[allEmojis[letter]]}`);
                    } else {
                        //already has the role
                        bot.guilds.get(serverID).channels.get(reactLogChannelID).send(`<@!${user.id}> you already have ${emojiToRoleName[allEmojis[letter]]}`);
                    }
                }
            }
        }
    }
});

bot.on('messageReactionRemove', (messageReaction, user) => {
    if (user.id != bot.user.id) {
        //not bot
        if (messageReaction.message.channel.id === reactionChannelID) {
            //in channel
            //messageReaction.message.channel.send(`reaction ${messageReaction.emoji.toString()} removed by ${user.username}`);
            for (let letter in allEmojis) {
                if (allEmojis[letter] === messageReaction.emoji.toString()) {
                    //one of the emojis
                    let roleID = emojiToRoleID[allEmojis[letter]];
                    if (bot.guilds.get(serverID).members.get(user.id).roles.has(roleID)) {
                        //has role
                        bot.guilds.get(serverID).members.get(user.id).removeRole(roleID);
                        bot.guilds.get(serverID).channels.get(reactLogChannelID).send(`<@!${user.id}> removed ${emojiToRoleName[allEmojis[letter]]}`);
                    }
                }
            }
        }
    }
});

bot.on('guildMemberAdd', (addedMember) => {
    if (addedMember.guild.id === serverID) {
        bot.guilds.get(serverID).defaultChannel.send(`<@${addedMember.id}> welcome to the server! Please change your nickname to your name and head over to <#${config.reactionChannelID.actual}> to get some roles!`);
    }
});

bot.on('disconnect', (e) => {
    console.log('disconnected');
});

bot.login(config.token);