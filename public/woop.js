import Woop from "./src/Woop.js"
window.onload = ()=>{

    let woop = new Woop(
        document.getElementById("woop"),
        {
            render        : "2D",
            field_of_view : 90,
            scale         : 2,
            debug         : true,
        }
    )

    woop.run()

}