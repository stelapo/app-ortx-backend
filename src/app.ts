import express from "express";
import bodyParser from 'body-parser';
//import * as path from "path";

class App {
    public express: any;

    constructor() {
        this.express = express();
        this.mountHomeRoute();
        /*this.prepareStatic();
        this.setViewEngine();*/
    }
    /*
        // This serves everything in `static` as static files
        private prepareStatic(): void {
         this.express.use(express.static(path.join(__dirname, "/../static/")));
        }
    */
    private prepare(): void {
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({ extended: false }));
    }

    /*
        // Sets up handlebars as a view engine
        private setViewEngine(): void {
          this.express.set("view engine", "hbs");
          this.express.set("views", path.join(__dirname, "/../src/views"));
        }
    */
    // Prepare the / route to show a hello world page
    private mountHomeRoute(): void {
        const router = express.Router();
        router.get("/", (req, res) => {
            res.json({
                message: "Hello World!"
            });
        });
        this.express.use(router);
    }
}

export default new App().express;