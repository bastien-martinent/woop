// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path         = require( "path" )
const glob         = require( "glob" )
const isProduction = process.env.NODE_ENV == "production"

let entries =  {}
let files   = glob.sync( "./src/woop.js" )


files.forEach( function( filePath ){
    let fileName = path.basename( filePath , '.js' )
    entries[ fileName ] = filePath
})

const config = {
    entry   : entries,
    output  : {
        path     : path.resolve( __dirname, "public/dist/woop/" ),
        filename : "./woop.min.js",
        library  : { type: "module" },
    },
    experiments: {
        outputModule: true
    },
    plugins : [],
    module  : {
        rules : [
            {
                test   : /\.(js|jsx)$/i,
                loader : "babel-loader",
            },
            {
                test : /\.(eot|svg|ttf|woff|woff2|png|jpg|gif|wad)$/i,
                type : "asset",
            },
        ],
    },
}

module.exports = () => {
  config.mode = ( isProduction ) ? "production" : "development"
  return config
}
