class Chip8 {
    constructor() {
        this.font_set = []
        init()
    }
    
    init() {
        
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
        
        //the timers are initially set to zero
        this.delayTimer = 0
        this.soundTimer = 0
        
        //this is the program counter forgot proper start position
        this.pc = 0x200
    }
    
    load(file) {
        for (var i = 0; i < file.length; i++) {
            this.memory[i + 512] = file[i]
        }
    }
    
    sPx() { }
    
    cycle() {
        //fetch code
        
        this.opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1]
        
        //this just returns the first 'letter' of the opcode
        switch (this.opcode & 0xF000) {
            
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
                if (this.V[this.opcode & 0x0F00] == (this.opcode & 0x00FF)) {
                    this.pc += 2
                }
                break
            case 0x4000:
                if (this.V[this.opcode & 0x0F00] != (this.opcode & 0x00FF)) {
                    this.pc += 2
                }
                break
            case 0x5000:
                if (this.V[this.opcode & 0x0F00] == this.V[this.opcode & 0x00F0]) {
                    this.pc += 2
                }
                break
            case 0x6000:
                this.V[this.opcode & 0x0F00] = this.opcode & 0x00FF
                break
            case 0x7000:
                this.V[this.opcode & 0x0F00] += this.opcode & 0x00FF
                break
            case 0x8000:
                
                switch(this.opcode & 0x000F) {
                    //bitops incoming
                    case 0x0000:
                        this.V[this.opcode & 0x0F00] = this.V[this.opcode & 0x00F0]
                        break
                    case 0x0001:
                        this.V[this.opcode & 0x0F00] = this.V[this.opcode & 0x0F00] | this.V[this.opcode & 0x00F0]
                        this.V[0xF] = 0
                        break
                    case 0x0002:
                        this.V[this.opcode & 0x0F00] = this.V[this.opcode & 0x0F00] & this.V[this.opcode & 0x00F0]
                        this.V[0xF] = 0
                        break
                    case 0x0003:
                        this.V[this.opcode & 0x0F00] = this.V[this.opcode & 0x0F00] ^ this.V[this.opcode & 0x00F0]
                        this.V[0xF] = 0
                        break
                    //time for maths
                    case 0x0004:
                        this.V[this.opcode & 0x0F00] += this.V[this.opcode & 0x00F0]
                        this.V[0xF] = (this.V[this.opcode & 0x0F00] > 255) ? 1 : 0
                        if (this.V[this.opcode & 0x0F00] > 255) {
                            this.V[this.opcode & 0x0F00] -= 256
                        }
                        break
                    case 0x0005:
                        this.V[0xF] = (this.V[this.opcode & 0x0F00] > this.V[this.opcode & 0x00F0]) ? 0 : 1
                        this.V[this.opcode & 0x0F00] -= this.V[this.opcode & 0x00F0]
                        
                        break
                    case 0x0006:
                        this.V[0xF] = this.V[this.opcode & 0x0F00] & 0x1
                        this.V[this.opcode & 0x0F00] >>= 1
                        break
                    case 0x0007:
                        this.V[this.opcode & 0x0F00] = this.V[this.opcode & 0x00F0] - this.V[this.opcode & 0x0F00]
                        break
                    case 0x000E:
                        //remember that each v register is 16 bytes? 128 bits
                        this.V[0xF] = this.V[this.opcode & 0x0F00] & 0x80
                        this.V[this.opcode & 0x0F00] <<= 1
                        break
                        
                }
                
                break
            case 0x9000:
                if(this.V[this.opcode & 0x0F00] != this.V[this.opcode & 0x00F0]) {
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
                this.V[this.opcode & 0x0F00] = (Math.random() * 255) & (this.opcode & 0x00FF)
                break
            case 0xD000:
                break
            
        }
        
        //update timers
    }
    
}

module.exports = Chip8