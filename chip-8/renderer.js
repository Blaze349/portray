class Renderer {
    constructor() {
        this.width = 512
        this.height = 256
    }
    
    setupCanvas() {
        var canvas = document.getElementById("emu")
        this.ctx = canvas.getContext("2d")
    }
    
    setupInput() {
        
    }
    
    clear() {
        this.ctx.clearRect(0,0,512,256)
    }
    
    draw(display) {
        
        this.clear()
        
        for (var i = 0; i < display.length; i++) {
            var x = (display[i] % 64) * 64
            var y = Math.floor((display[i] - x) / 64) * 64
            
            if (display[i] > 1) {
                this.ctx.fillStyle = '#FFFFFF'
            } else {
                this.ctx.fillStyle = '#000000'
            }
            
            this.ctx.fillRect(x, y, 64, 64)
        }
    }
}

module.exports = Renderer