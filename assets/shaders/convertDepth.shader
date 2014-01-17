vertex:
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  uniform vec2 uViewportSize;

  varying vec2 vTextureCoord;
  varying vec2 vViewportSize;

  void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
    vViewportSize = uViewportSize;
  }

fragment:
  precision mediump float;

  varying vec2 vViewportSize;

  uniform sampler2D uSampler;

  varying vec2 vTextureCoord;

  float unpack (vec4 colour)
  {
    const vec4 bitShifts = vec4(1.0 / (256.0 * 256.0 * 256.0),
        1.0 / (256.0 * 256.0),
        1.0 / 256.0,
        1);
    return dot(colour , bitShifts);
  }

  void main(void) {
    float depth = unpack(texture2D(uSampler, vTextureCoord));
    depth = pow(depth, 64.0);
    gl_FragColor = vec4(depth, depth, depth, 1.0);
  }

