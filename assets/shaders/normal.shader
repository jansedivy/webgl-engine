vertex:
  attribute vec3 aVertexPosition;
  attribute vec3 aVertexNormal;

  uniform mat4 uPMatrix;
  uniform mat4 uMVMatrix;
  uniform mat3 uNMatrix;

  varying vec3 vVertexNormal;

  void main(void) {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vVertexNormal = uNMatrix * aVertexNormal;
  }

fragment:
  precision mediump float;

  varying vec3 vVertexNormal;

  void main(void) {
    gl_FragColor = vec4(normalize(vVertexNormal), 0.0);
  }
