# YAMI_BOT_JS
Discord bot made with nodejs and discordjs

## Functions
- Plays Youtube videos in voice channel
- Weapon calculation for Monster Hunter World
- Motionvalue printtables

#### How Weapon Strength is calculated
Since actual damage in Monster Hunter is very variable, we estimate certain values to generalize parts of the calculation so that the weapon itself is the deciding factor: The raw weapon damage is calculated as usual, then we define resistance values for a default target dummy that is an average of most monster resistances. Afterwards we calculate the average motion value per hit for the weapontype used. This is important for the fact that in the raw weapon calculation elemental damage is a very small percentage, but since we want to simulate the weapon performance as accurate as possible without setting special values for target and move, we use those dummy values.

## In Developement
- Calculating MV/s for generating DPS values.
- Webscraping Kiranico for Monster Hunter World data once game is out.
- Monster printtables
- Calculating best weapon average.
- Using data for calculating best weapon for certain monsters.

### Authors
@Rathalos93 Wolf#4328 <br />
@Hoppix Hoppix#6723
