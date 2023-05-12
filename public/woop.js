import Woop from "./src/Woop.js"
window.onload = ()=>{
    let woop = new Woop(
        document.getElementById("woop"),
        {
            render        : "2D",
            field_of_view : 90,
            frame_rate    : 60,
            scale         : 4,
            debug         : true,
        }
    )
    woop.run()
}