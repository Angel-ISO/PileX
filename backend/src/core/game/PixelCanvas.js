
export class PixelCanvas {
  constructor(width = 500, height = 500) {
    this.width = width;
    this.height = height;
    this.canvas = [];
    this.connectedUsers = new Map();

    this.initialize();
    console.log(`PixelCanvas initialized: ${width}x${height}`);
    console.log(`Canvas memory usage: ~${Math.round((width * height * 7) / 1024)} KB`);
  }

 
  initialize() {
    for (let y = 0; y < this.height; y++) {
      this.canvas[y] = [];
      for (let x = 0; x < this.width; x++) {
        this.canvas[y][x] = '#FFFFFF'; 
      }
    }
    console.log(`Canvas grid initialized with ${this.width * this.height} pixels`);
    console.log(`Sample pixels: [0][0] = ${this.canvas[0][0]}, [250][250] = ${this.canvas[250][250]}`);
  }

 
  paintPixel(x, y, color, userId) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      console.log(`Invalid coordinates: (${x}, ${y})`);
      return false;
    }

    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      console.log(`Invalid color format: ${color}`);
      return false;
    }

    const oldColor = this.canvas[y][x];
    this.canvas[y][x] = color;

    console.log(`Pixel painted: (${x}, ${y}) ${oldColor} → ${color} by ${userId}`);
    return true;
  }

 
  getPixel(x, y) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return null;
    }
    return this.canvas[y][x];
  }

  
  getCanvasState() {
    console.log(`getCanvasState() called: returning ${this.canvas.length}x${this.canvas[0]?.length} canvas`);
    return this.canvas;
  }

  
  addUser(userId, username) {
    this.connectedUsers.set(userId, {
      username,
      connectedAt: Date.now(),
      pixelsPainted: 0
    });
    console.log(`User ${username} (${userId}) joined PixelCanvas`);
  }

  
  removeUser(userId) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      console.log(`User ${user.username} (${userId}) left PixelCanvas`);
      this.connectedUsers.delete(userId);
    }
  }

  
  trackPixelPainted(userId) {
    const user = this.connectedUsers.get(userId);
    if (user) {
      user.pixelsPainted++;
    }
  }

  
  getStats() {
    const totalPixels = this.width * this.height;
    const paintedPixels = this.canvas.flat().filter(color => color !== '#FFFFFF').length;

    return {
      width: this.width,
      height: this.height,
      totalPixels,
      paintedPixels,
      paintedPercentage: ((paintedPixels / totalPixels) * 100).toFixed(2),
      connectedUsers: this.connectedUsers.size,
      users: Array.from(this.connectedUsers.entries()).map(([id, data]) => ({
        id,
        username: data.username,
        pixelsPainted: data.pixelsPainted,
        connectedAt: data.connectedAt
      }))
    };
  }

  
  getRegion(startX, startY, endX, endY) {
    const region = [];
    for (let y = Math.max(0, startY); y < Math.min(this.height, endY); y++) {
      region[y - startY] = [];
      for (let x = Math.max(0, startX); x < Math.min(this.width, endX); x++) {
        region[y - startY][x - startX] = this.canvas[y][x];
      }
    }
    return region;
  }
}