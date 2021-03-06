vertex:
  attribute vec3 aVertexPosition;

  uniform mat4 uPMatrix;
  uniform mat4 uMVMatrix;

  varying vec4 vPosition;

  void main(void) {
    vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * vPosition;
  }

fragment:
  precision mediump float;

  varying vec4 vPosition;

  void main(void) {
    gl_FragColor = vPosition;
  }
