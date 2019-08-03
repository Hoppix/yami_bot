const schedule = require("node-schedule");
const CalendarEvent = require("./calendarEvent.js");
const oUtility = require("../utility.js");

const sAcceptEmoji = "✅";
const sDeclineEmoji = "❌";

/**
 * Creates invite hooks for calendar events
 * @type {{}}
 */
module.exports =
	{
		sThirtyMinutes: "*/30 * * * *",
		sSixtyMinutes: "*/60 * * * *",
		sEveryMinute: "* * * * *",
		sAcceptEmoji: sAcceptEmoji,
		sDeclineEmoji: sDeclineEmoji,

		//contains all events mapped by its id
		mCalendarEvents: new Map(),

		/**
		 * initialises a scheduled job which checks the time for every queued event
		 * if a event starts in 30 minutes a message will be broadcasted and the event is removed from the queue
		 */
		init: function()
		{
			var that = this;
			schedule.scheduleJob(this.sThirtyMinutes, function() {
				const iToday = Date.now();
				console.log("EVENTS: " + "running job at " + iToday.toString());
				that.mCalendarEvents.forEach(function(oCalendarEvent, sId, mEvents) {
					const iEventDate = oCalendarEvent.getDate().getTime();
					const iEpochMili = iEventDate - iToday;
					const iMinutes = oUtility.msToTime(iEpochMili).minutes;

					if(iMinutes > 60) return;

					const oMessage = "Event: " + oCalendarEvent.getName() + " starts in " + iMinutes + " minutes, be ready!";
					//"@everyone " +
					oCalendarEvent.getMessage().channel.send( oMessage);
					for(let i = 0; i < oCalendarEvent.getMembers().length; i++)
					{
						oCalendarEvent.getMembers()[i].send(oMessage);
					}
					that.mCalendarEvents.delete(sId);
				});
			});

			console.log("EVENTS: " + "event schedule initialized!");
		},

		/**
		 * creates a new event with a guildchannel message for user to accept or decline the event
		 * @param aParams
		 * @param oMessage
		 */
		createEventInvite: function(aParams, oCommandMessage)
		{
			const oChannel = oCommandMessage.channel;
			if(oChannel.type !== "text") return;
			var that = this;

			const oEmbed =
				{
					embed: {
						title: "Event: " + aParams[1],
						color: 0xDBA100,
						description: "Time: " +  oUtility.getDateFromDateString(aParams[0]).toString(),
						timestamp: new Date(),
						fields: [],
					}
				};


			oChannel.send(oEmbed).then(
				function(oMessage)
				{
					const oEvent = new CalendarEvent(aParams[0], aParams[1], oMessage.id, oMessage);
					that.mCalendarEvents.set(oMessage.id , oEvent);

					oMessage.react(sAcceptEmoji);
					oMessage.react(sDeclineEmoji);
				});

		},

		/**
		 * removes a event by its id
		 * @param aParams
		 * @param oMessage
		 */
		removeEvent: function(aParams, oMessage)
		{
			const oCalendarEvent = this.mCalendarEvents.get(aParams[0]);
			this.mCalendarEvents.delete(aParams[0]);
			oMessage.reply("Deleted Event: " + oCalendarEvent.toString());
		},

		/**
		 * updates a event by its id
		 * @param aParams
		 * @param oMessage
		 */
		updateEvent: function(aParams, oMessage)
		{
			const oCalendarEvent = this.mCalendarEvents.get(aParams[0]);

			if(aParams[1]) oCalendarEvent.setDate(aParams[1]);
			if(aParams[2]) oCalendarEvent.setName(aParams[2]);
			oMessage.reply("Updated Event: " + oCalendarEvent.toString());
		},

		/**
		 *
		 * @param oMessage
		 */
		getAllEvents: function(oMessage)
		{
			if(this.mCalendarEvents.size === 0) {
				oMessage.reply("No events in queue!");
				return;
			}

			this.mCalendarEvents.forEach(function (oCalendarEvent, sId, mEvents) {
				const oEmbed =
					{
						embed: {
							title: "Event: " + oCalendarEvent.toString(),
							color: 0xDBA100,
							description: "Time: " + oCalendarEvent.getDate().toString(),
							fields: [],
						}
					};

				for(let i = 0; i < oCalendarEvent.getMembers().length; i++)
				{
					oEmbed.embed.fields.push({name: oCalendarEvent.getMembers()[i].username, value: "----------------------------------"});
				}
				oMessage.channel.send(oEmbed);
			});
		},

		/**
		 *
		 * @returns {Map}
		 */
		getCalendarEvents: function()
		{
			return this.mCalendarEvents;
		},

		/**
		 *
		 * @param sId
		 * @returns {CalendarEvent}
		 */
		getCalendarEventById: function(sId)
		{
			return this.mCalendarEvents.get(sId);
		},

		/**
		 *
		 * @param oReaction
		 * @param oUser
		 */
		handleEventReactionAdd: function(oReaction, oUser)
		{
			const oCalendarEvent = this.mCalendarEvents.get(oReaction.message.id);
			if(oCalendarEvent)
			{
				oCalendarEvent.addMember(oUser);
				console.log("added member to event: " + oCalendarEvent.getName() + "-" + oCalendarEvent.getId() + " Member " + oUser.username);

				const oReactions = oReaction.message.reactions.get(this.sAcceptEmoji);

				if(oReactions.count > 1)
				{
					oReaction.remove();
				}
			}

		},

		/**
		 *
		 * @param oReaction
		 * @param oUser
		 */
		handleEventReactionRemove: function(oReaction, oUser)
		{
			const oCalendarEvent = this.mCalendarEvents.get(oReaction.message.id);
			if(oCalendarEvent)
			{
				oCalendarEvent.removeMember(oUser);
				console.log("removed member from event: " + oCalendarEvent.getName() + "-" + oCalendarEvent.getId() + " Member " + oUser.username);

				const oReactions = oReaction.message.reactions.get(this.sDeclineEmoji);

				if(oReactions.count > 1)
				{
					oReaction.remove();
				}
			}


		},

		/**
		 *
		 * @param oReaction
		 * @param sEmoji
		 */
		handleEventReactionRestore: function(oReaction, sEmoji)
		{
			const oCalendarEvent = this.mCalendarEvents.get(oReaction.message.id);
			if(oCalendarEvent)
			{
				oReaction.message.react(sEmoji);
			}
		},

		/**
		 *
		 * @param oMessage
		 */
		printEventHelpMessage: function(oMessage)
		{
			const oNewEvent = {
				name: "!newevent [date] [name]",
				value: "Creates a new event invite with a dd.mm.yyyy-hh:MM format"
			};
			const oDeleteEvent = {
				name: "!removeevent [id]",
				value: "Removes a event from the queue given by its id"
			};

			const oShowEvents = {
				name: "!showevents",
				value: "Shows all currently queued events"
			};

			const oFooter = {text: "Author: Hoppix#6723"};

			const oEmbed =
				{
					embed: {
						color: 900000,
						description: "Calendar event commands:",
						fields: [oNewEvent, oDeleteEvent, oShowEvents],
						footer: oFooter
					}
				};
			oMessage.reply(oEmbed);
		}
	};