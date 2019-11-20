/**
 * Const namespace for module
 */
const DDBPOPPER = {};

class DDBPopper {
    constructor(){
        this.dnd5eSheetClasses = [];
        this.existingPopup = null;

        this._hookOnRenderCharacterSheets();    
    }

    /**
     * Some static config used elsewhere in the module
     * @returns {Object} module config
     */
    static get CONFIG() {
        return {
            moduleName: "ddb-popper",
            ddbLogo: "fab fa-d-and-d",
            aTitle: "left-click to open, right-click to change URL",
            windowFeatures: "resizeable,scrollbars,location=no,width=768,height=968",
            flagNames: {
                ddbURL: "ddbURL"
            },
            template: "./modules/ddb-popper/template/ddb-popper.html"
        }  
    }
    
    get defaultCharacterSheet() {
        const classes = Object.values(CONFIG.Actor.sheetClasses.character);
        const defaultSystemSheetClass = classes.find(c => c.default).id;
        const defaultSheetClass = defaultSystemSheetClass.split(".")[1];
        return defaultSheetClass;
    }
    

    /**
     * Hooks on render of the default Actor sheet in order to insert the DDB Button
     */
    _hookOnRenderCharacterSheets() {
        this.dnd5eSheetClasses = [];
        const sheetClasses = Object.values(CONFIG.Actor.sheetClasses.character);

        for (let s of sheetClasses) {
            if(s.id.includes("dnd5e")) {
                const sheetClass = s.id.split(".")[1];
                this.dnd5eSheetClasses.push(sheetClass);
                Hooks.on(`render${sheetClass}`, (app, html, data) => {
                    this._addDDBButton(app, html, data);
                });
            }
        }
        
        /*
        Hooks.on(`render${this.defaultActorSheet}`, (app, html, data) => {
            this._addDDBButton(app, html, data);
        });
        */
    }

    /**
     * For a given actor's data, get the D&D Beyond URL if it exists in actor flags, 
     * and if not, register and try again
     * @param {Object} actor -- an actor entity
     * @returns {String} ddbURL -- the matching D&D Beyond URL (if any)
     */
    async _getActorDDBURL(actor) {
        let actorDDBURL;

        try {
            actorDDBURL = await actor.getFlag(DDBPopper.CONFIG.moduleName, DDBPopper.CONFIG.flagNames.ddbURL);
            return actorDDBURL;
        } catch (e) {
            console.log(e);
            return;
        }

    }

    /**
     * Adds the DDB button to the supplied html
     * @param {Object} app -- the actor sheet app
     * @param {Object} html -- the html of the ActorSheet5eCharacter
     * @param {Object} data -- the data of the actor
     */
    async _addDDBButton (app, html, data) {
        /**
         * jquery reference to the D&D Beyond button to add to the sheet
         */
        const ddbButton = $(
            `<a class="ddb-popper" title="${DDBPopper.CONFIG.aTitle}">
                <i class="${DDBPopper.CONFIG.ddbLogo}"></i>
                <span> DDB</span>
            </a>`
        );

        if (html.find(".ddb-popper").length > 0) {
            return;
        }
        
        if (!this.dnd5eSheetClasses.includes(app.constructor.name)) {
            return;
        }        


        /**
         * Finds the header and the close button
         */
        const windowHeader = html.find(".window-header");
        const windowCloseBtn = windowHeader.find(".close");

        
        
        /**
         * Create an instance of the ddbButton before the close button
         * Removes existing instances first to avoid duplicates
         */
        windowCloseBtn.before(ddbButton);

        /**
         * When the DDB button is clicked, lookup the DDB URL, then look for an existing popup,
         * and if none exists, and the DDB URL is null, open the form to set the URL, 
         * otherwise if the popup does not exist but the DDB URL is not null, create the popup
         * or else simply focus the existing popup
         */
        ddbButton.click(async ev => {
            const actorDDBURL = await this._getActorDDBURL(app.entity);

            if (actorDDBURL == null || actorDDBURL.length == 0){
                this._openURLForm(app.entity, actorDDBURL, data, {closeOnSubmit: true});
            } else if ((this.existingPopup == null || this.existingPopup.closed) && actorDDBURL.length > 0) {
                this.existingPopup = window.open(actorDDBURL, DDBPopper.CONFIG.moduleName, DDBPopper.CONFIG.windowFeatures);
            } else if (this.existingPopup && actorDDBURL.length > 0) {
                this.existingPopup.focus();
            }
        });

        /**
         * When the DDB button is right-clicked, lookup the DDB URL for the actor,
         * then open the form to set the URL 
         */
        ddbButton.contextmenu(async ev => {
            ev.preventDefault();
            const actorDDBURL = await this._getActorDDBURL(app.entity);

            this._openURLForm(app.entity, actorDDBURL, data, {closeOnSubmit: true});
        });

        /**
         * When the Close button is pressed close any open popups
         */
        windowCloseBtn.click(ev => {
            ev.preventDefault();

            if(this.existingPopup && !this.existingPopup.closed){
                this.existingPopup.close();
            }
        });
    }

    _openURLForm(actor, url, data, options){
        new DDBURLEntryForm(actor, url, data, options).render(true);
    }
}

/**
 * A simple form for entering a URL.
 * If the DDB URL already exists for the Actor referenced in the Actor sheet,
 * display that in the form
 * @param {Object} actor -- the actor entity from the Actor sheet
 * @param {String} actorDDBURL -- the DDB URL for the Actor that owns the Actor Sheet
 * @param {Object} data -- the actor data from the sheet
 * @param {Object} options -- any options to set (including those on the FormApplication/Application super classes)
 */
class DDBURLEntryForm extends FormApplication {
    constructor(actor, actorDDBURL, data, options){
        super(data, options);
        this.actor = actor;
        this.data = data;
        this.ddbURL = actorDDBURL;
    }
    
    /**
     * Default Options for this FormApplication
     */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "ddb-url",
            title: "D&D Beyond URL",
            template: DDBPopper.CONFIG.template,
            classes: ["sheet"],
            width: 500
        });
    }

    /**
     * Provide data (ddbURL if any) to the handlebars template
     */
    async getData() {
        const data = {
            ddbCharacterURL: this.ddbURL
        }
        return data;
    }

    /**
     * Executes on form submission.
     * Attempts to set the ddbURL flag on the underlying Actor
     * @param {Object} event -- the form submission event 
     * @param {Object} formData -- the form data
     */
    async _updateObject(event, formData) {
        try {
            this.actor.setFlag(DDBPopper.CONFIG.moduleName, DDBPopper.CONFIG.flagNames.ddbURL, formData.ddbCharacterURL);
        } catch (e) {
            throw e;   
        }
        
    }

}

DDBPOPPER.createDDBPopperInstance = function() {
    DDBPOPPER.instance = new DDBPopper();
    console.log(CONFIG.Actor.sheetClasses.character);
}  

Hooks.on("ready", () => {
    if (game.data.version == "0.4.0") {
        window.setTimeout(DDBPOPPER.createDDBPopperInstance, 500);
    } else {
        DDBPOPPER.createDDBPopperInstance();
    }

    
});