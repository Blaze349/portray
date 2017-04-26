class Renderer {
    constructor() {
        
    }
    
    setupCanvas() {
        var canvas = document.getElementById("emu")
        this.ctx = canvas.getContext("2d")
    }
}

module.exports = Renderer