# DDB Popper

![DDB Popper Demo](https://github.com/death-save/ddb-popper/blob/master/ddb_popper.gif)

## What it does
Adds a button to the 5e Actor Sheet that opens a popup of the matching D&D Beyond character for the actor.

## How to install it
1. From the Foundry setup page click Addon Modules
2. Click Install Module
3. Paste the link to the json (https://raw.githubusercontent.com/death-save/ddb-popper/master/module.json) into the box
4. Activate the module within any worlds you wish to use it in by clicking the checkmark next to it in Setup > Manage Modules


## How to use it

**IMPORTANT** Ensure you have logged into D&D Beyond in the same browser as your Foundry window to ensure that you have an authentication cookie for the popup to use.

1. Open the Actor sheet of the character you want to have linked to D&D Beyond. 
2. Click the new **DDB** button in the header bar near the Close button:
![DDB button](https://imgur.com/Ek8uMMy.png)
3. Enter your D&D Beyond character URL in the form and click Save
![DDB URL Form](https://imgur.com/scnX8X5.png)
4. From now on when you click the **DDB** button on that actor sheet it will open the D&D Beyond popup or "focus" it if it is already open
![DDB Popup](https://imgur.com/6VbOPIm.png)

Note 1: if you want to change/remove the URL for an actor, simply right-click the **DDB** button to open the form again
Note 2: when you close the character sheet, it will close the DDB Popper window

## KNOWN ISSUES

[Issues](https://github.com/death-save/ddb-popper/issues)

* Initiative rolls from D&D Beyond (via [Beyond20](https://beyond20.here-for-more.info/)) break the Combat Tracker for that encounter. *Workaround* have players roll initiative from the combat tracker in Foundry, or leave their initiative un-rolled and the module will roll it automatically on round 1
