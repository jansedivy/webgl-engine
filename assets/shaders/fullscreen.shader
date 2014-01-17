vertex:
  attribute vec3 aVertexPosition;
  attribute vec2 aTextureCoord;

  varying vec2 vTextureCoord;

  void main(void) {
    gl_Position = vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
  }

fragment:
  precision mediump float;

  uniform sampler2D uSampler;

  uniform vec3 uLightPosition;
  uniform vec3 uCameraPosition;

  varying vec2 vTextureCoord;

  float unpack(vec4 colour) {
      const vec4 bitShifts = vec4(1.0,
          1.0 / 255.0,
          1.0 / (255.0 * 255.0),
          1.0 / (255.0 * 255.0 * 255.0));
    return dot(colour, bitShifts);
  }

  float readDepth(sampler2D texture, const in vec2 coord ) {
    float cameraNear = 0.01;
    float cameraFar = 1000.0;
    return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpack( texture2D( texture, coord ) ) * ( cameraFar - cameraNear ) );
  }

  void main(void) {
    vec3 test = texture2D(uSampler, vTextureCoord).rgb;
    gl_FragColor = vec4(test, 1.0);
  }

