vertex:
  attribute vec3 aVertexPosition;
  uniform mat4 uPMatrix;
  uniform mat4 uMVMatrix;

  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  }

fragment:
  precision mediump float;

  varying vec4 vPosition;

  vec4 pack (float depth)
  {
    const vec4 bias = vec4(1.0 / 255.0,
        1.0 / 255.0,
        1.0 / 255.0,
        0.0);

    float r = depth;
    float g = fract(r * 255.0);
    float b = fract(g * 255.0);
    float a = fract(b * 255.0);
    vec4 colour = vec4(r, g, b, a);

    return colour - (colour.yzww * bias);
  }

  void main(void) {
    gl_FragColor = pack(gl_FragCoord.z);
  }
