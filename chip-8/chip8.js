class Chip8 {
    constructor(renderer) {
        this.renderer = renderer
        this.font_set = [
          0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
          0x20, 0x60, 0x20, 0x20, 0x70, // 1
          0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
          0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
          0x90, 0x90, 0xF0, 0x10, 0x10, // 4
          0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
          0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
          0xF0, 0x10, 0x20, 0x40, 0x40, // 7
          0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
          0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
          0xF0, 0x90, 0xF0, 0x90, 0x90, // A
          0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
          0xF0, 0x80, 0x80, 0x80, 0xF0, // C
          0xE0, 0x90, 0x90, 0x90, 0xE0, // D
          0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
          0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ]
        this.init()
    }
    
    init() {
        
        this.displayHeight = 32
        this.displayWidth = 64
        
        this.display = new Array(this.displayHeight * this.displayWidth)
        this.opcode = null
        
        this.key = new Array(16)
        
        //the 16 registers
        this.V = new Array(16)

        //the virtual ram
        this.memory = new Array(new ArrayBuffer(0x1000))
        
        for (var i = 0; i < this.font_set.length; i++) {
            this.memory[i] = this.font_set[i]
        }
        //for subroutines
        this.stack = new Array(16)
        
        //this points to the parent func
        this.stackPointer = 0
        
        //this is the special address register
        
        this.I = 0
        
        this.display.map(function (val, i) {
            return 0
        })
        //the timers are initially set to zero
        this.delayTimer = 0
        this.soundTimer = 0
        
        //this is the program counter forgot proper start position
        this.pc = 0x200
        
        this.keySet = {
            '1': 0x1,'2': 0x2,'3': 0x3,'4': 0x4,
            'Q': 0x4,'W':0x5,'E': 0x6,'R': 0xD,
            'A': 0x7,'S':0x8,'D': 0x9,'F': 0xE,
            'Z': 0xA,'X':0x0,'C': 0xB, 'V':0xF,
        }
        
        this.keyPressed = null
        
        document.onkeyup = document.onkeydown = this.OnKey;
        setInterval(this.updateTimers,60)
    }
    
    onKey(e) {
        var str = String.fromCharCode(e.which);
        var val = (e.type == 'keydown') ? true : false;
        
        var i = this.keySet[str];
        
        if(i !== undefined) {
          this.key[i] = val;
        }
        
        this.keyPressed = this.key.reduce( ((prevValue,currentValue) => (prevValue | currentValue)) )
    }
    updateTimers() {
        if (this.delayTimer > 0) {
            this.delayTimer--
        }
        if (this.soundTimer > 0) {
            this.soundTimer--
        }
    }
    load(fileName) {
        var f = new FileReader()
        f.addEventListener('done', function() {
            var file = new Uint8Array(f.result)
            file.map(function(val, i) {
                this.memory[i + 512] = file[i]
            })
        })
        
        f.readAsArrayBuffer(fileName)
    }
    
    byteToHex(opcode) {
        var tempCode = (opcode).toString(16).toUpperCase()
        var addln = 4 - tempCode.length
        var pad =""
        for(var i = 0; i< addln; i++) {
            pad = pad + "0"
        }
        var newCode = "0x"+ pad + tempCode
        return newCode;
    }
    
    clear() {
        for (var i = 0; i < this.display.length; i++) {
            this.display[i] = 0
        }
        this.renderer.clear()
    }
    
    cycle() {
        //fetch code
        
        this.opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1]
        //this.opcode = this.byteToHex(this.opcode)
        //this just returns the first 'letter' of the opcode
        switch (this.opcode & 0xF000) {
            
            case 0x0000:
                switch(this.opcode & 0x00FF) {
                    case 0x00E0:
                        this.clear()
                        this.pc += 2
                        break
                    case 0x00EE:
                        this.pc = this.stack[--this.stackPointer]
                        break
                    default:
                        this.pc += 2
                }
                break
            case 0x1000:
                //like before the AND returns a byte with 1s if two bits match. Bad explaination :p
                this.pc = this.opcode & 0xFFF
                break
            case 0x2000:
                //adds an address to the stack
                this.stack[this.stackPointer] = this.pc
                this.stackPointer++
                this.pc = this.opcode & 0xFFF
                break
            case 0x3000:
                if (this.V[(this.opcode & 0x0F00 >> 8] == (this.opcode & 0x00FF)) {
                    this.pc += 4
                } else {
                    this.pc += 2
                }
                break
            case 0x4000:
                if (this.V[(this.opcode & 0x0F00 >> 8] != (this.opcode & 0x00FF)) {
                    this.pc += 4
                } else {
                    this.pc += 2
                }
                break
            case 0x5000:
                if (this.V[(this.opcode & 0x0F00) >> 8] == this.V[(this.opcode & 0x00F0) >> 4]) {
                    this.pc += 4
                }else {
                    this.pc += 2
                }
                break
            case 0x6000:
                this.V[(this.opcode & 0x0F00) >> 8] = this.opcode & 0x00FF
                break
            case 0x7000:
                this.V[(this.opcode & 0x0F00) >> 8] += this.opcode & 0x00FF
                break
            case 0x8000:
                
                switch(this.opcode & 0x000F) {
                    //bitops incoming
                    case 0x0000:
                        this.V[(this.opcode & 0x0F00 >> 8] = this.V[(this.opcode & 0x00F0 >> 4]
                        break
                    case 0x0001:
                        this.V[(this.opcode & 0x0F00 >> 8] = this.V[(this.opcode & 0x0F00 >> 8] | this.V[(this.opcode & 0x00F0 >> 4]
                        this.V[0xF] = 0
                        break
                    case 0x0002:
                        this.V[(this.opcode & 0x0F00 >> 8] = this.V[(this.opcode & 0x0F00 >> 8] & this.V[(this.opcode & 0x00F0 >> 4]
                        this.V[0xF] = 0
                        break
                    case 0x0003:
                        this.V[(this.opcode & 0x0F00 >> 8] = this.V[(this.opcode & 0x0F00 >> 8] ^ this.V[(this.opcode & 0x00F0 >> 4]
                        this.V[0xF] = 0
                        break
                    //time for maths
                    case 0x0004:
                        this.V[(this.opcode & 0x0F00 >> 8] += this.V[(this.opcode & 0x00F0) >> 4]
                        this.V[0xF] = (this.V[(this.opcode & 0x0F00) >> 8] > 255) ? 1 : 0
                        if (this.V[(this.opcode & 0x0F00) >> 8] > 255) {
                            this.V[(this.opcode & 0x0F00) >> 8] -= 256
                        }
                        break
                    case 0x0005:
                        this.V[0xF] = (this.V[(this.opcode & 0x0F00) >> 8] > this.V[(this.opcode & 0x00F0) >> 4]) ? 0 : 1
                        this.V[(this.opcode & 0x0F00) >> 8] -= this.V[(this.opcode & 0x00F0) >> 4]
                        
                        break
                    case 0x0006:
                        this.V[0xF] = this.V[(this.opcode & 0x0F00 >> 8] & 0x1
                        this.V[(this.opcode & 0x0F00 >> 8] >>= 1
                        break
                    case 0x0007:
                        this.V[(this.opcode & 0x0F00 >> 8] = this.V[(this.opcode & 0x00F0) >> 4] - this.V[(this.opcode & 0x0F00 >> 8]
                        break
                    case 0x000E:
                        //remember that each v register is 16 bytes? 128 bits
                        this.V[0xF] = this.V[(this.opcode & 0x0F00 >> 8] & 0x80
                        this.V[(this.opcode & 0x0F00 >> 8] <<= 1
                        break
                        
                }
                
                break
            case 0x9000:
                if(this.V[(this.opcode & 0x0F00 >> 8] != this.V[(this.opcode & 0x00F0) >> 4]) {
                    this.pc += 4
                } else {
                    this.pc += 2
                }
                break
            case 0xA000:
                this.I = this.opcode & 0x0FFF
                break
            case 0xB000:
                this.pc = this.V[0] + (this.opcode & 0x0FFF)
                break
            case 0xC000:
                this.V[(this.opcode & 0x0F00 >> 8] = (Math.random() * 255) & (this.opcode & 0x00FF)
                break
            case 0xD000:
                var x = V[(this.opcode & 0x0F00) >> 8]
                var y = V[(this.opcode & 0x00F0) >> 4]
                var height = this.opcode & 0x000F
                
                this.V[0xF] = 0
                
                //loop through the rows
                
                for (var yline = 0; yline < height; yline++) {
                    //find the bit flag on the line
                    var pixel = this.memory[this.I + yline]
                    
                    for (var xline = 0; xline < height; xline++) {
                        /* 
                            Remember that using & with a bit returns 1 if they are both 1?
                            This does that to pixel. It goes through it and shifts it using xline for the next part
                        */
                        if ((pixel & (0x80 >> xline)) != 0) {
                            /* This gets the grid coords. X + xline gets x coordinate y+ yline gets the y coordinate
                            You can just multiply y by width to get the real coord
                            */
                            if (this.display[x + xline + ((y + yline) * this.displayWIdth)] == 1) { this.V[0xF] = 1 }
                            this.display[x + xline + ((y + yline) * this.displayWIdth)] ^= 1
                        }
                    }
                }
                this.drawFlag=true
                this.pc += 2
                break
                
                //input
            case 0xE000:
                switch(this.opcode & 0x000F) {
                    case 0x000E:
                        console.log("key check")
                        if (this.key[this.V[(this.opcode & 0x0F00) >> 8]] != 0) {
                            this.pc += 4
                        }else {
                            this.pc += 2
                        }
                        break
                    case 0x0001:
                        console.log("key check")
                        if (this.key[this.V[(this.opcode & 0x0F00) >> 8]] == 0) {
                            this.pc += 4
                        }else {
                            this.pc += 2
                        }
                        break
                }
                break
            case 0xF000:
                switch(this.opcode & 0x000F) {
                    case 0x0007:
                        this.V[(this.opcode & 0x0F00 >> 8] = this.delayTimer
                        break
                    case 0x000A:
                        this.keyPressed = false
                        for (var i = 0; i < 16; i++) {
                            if (this.key[i] != 0) {
                                this.V[(this.opcode & 0x0F00) >> 8] = i
                                this.keyPressed = true
                                break
                            }
                            
                        }
                        if(this.keyPressed) {
                            this.pc += 2
                        }
                        break
                    case 0x0005:
                        this.delayTimer = this.V[(this.opcode & 0x0F00) >> 8]
                        this.pc += 2
                        break
                    case 0x0008:
                        this.soundTimer = this.V[(this.opcode & 0x0F00) >> 8]
                        this.pc += 2
                        break
                    case 0x000E:
                        this.I += this.V[(this.opcode & 0x0F00) >> 8]
                        this.pc += 2
                        break
                    case 0x0009:
                        this.I = this.V[(this.opcode & 0x0F00) >> 8] * 5
                        this.pc += 2
                        break
                    case 0x0003:
                        this.memory[this.I] = this.V[(this.opcode & 0x0F00) >> 8] / 100
                        this.memory[this.I + 1] = (this.V[(this.opcode & 0x0F00) >> 8] / 10) % 10
                        this.memory[this.I + 2] = (this.V[(this.opcode & 0x0F00) >> 8] % 100) % 10
                        this.pc += 2
                        break
                    case 0x0005:
                        //reg dump
                        switch(this.opcode & 0x00F0) {
                            case 0x0050:
                                for (var i = 0; i < this.V.length; i++) {
                                    this.memory[this.I + i] = this.V[i]
                                }
                                this.pc += 2
                                break
                            case 0x0060:
                                for (var i = 0; i < this.V.length; i++) {
                                    this.V[i] = this.memory[this.I + i]
                                }
                                this.pc += 2
                                break
                        }
                        break
                }
                break
                
        }
        
        //update timers
    }
    
}

