vertex:
  attribute vec3 aVertexPosition;
  attribute vec3 aVertexNormal;

  uniform mat4 uPMatrix;
  uniform mat4 uMVMatrix;
  uniform mat3 uNMatrix;

  uniform mat4 uLightMatrix;

  varying vec3 vTransformedNormal;
  varying vec4 vPosition;
  varying vec4 vShadowCoord;

  const mat4 depthScaleMatrix = mat4(0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);

  void main(void) {
    vPosition = uMVMatrix * vec4(aVertexPosition, 1.0);
    gl_Position = uPMatrix * vPosition;
    vTransformedNormal = uNMatrix * aVertexNormal;
    vShadowCoord = depthScaleMatrix * uLightMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
  }

fragment:
  precision mediump float;

  uniform sampler2D uDepth;

  varying vec4 vPosition;
  varying vec3 vTransformedNormal;
  varying vec4 vShadowCoord;

  uniform vec3 uLightPosition;
  uniform vec3 uCameraPosition;

  float unpack(vec4 colour) {
      const vec4 bitShifts = vec4(1.0,
          1.0 / 255.0,
          1.0 / (255.0 * 255.0),
          1.0 / (255.0 * 255.0 * 255.0));
    return dot(colour, bitShifts);
  }

  vec3 gamma(vec3 color){
    return pow(color, vec3(2.2));
  }

  void main(void) {
    vec3 color = vec3(1.0, 1.0, 1.0);

    vec4 shadowCoordinateWdivide = vShadowCoord / vShadowCoord.w;
    shadowCoordinateWdivide.z *= 0.999999;

    float distanceFromLight = unpack(texture2D(uDepth, shadowCoordinateWdivide.st));

    float shadow = 1.0;
    if (vShadowCoord.w > 0.0) {
      shadow = distanceFromLight < shadowCoordinateWdivide.z ? 0.5 : 1.0 ;
    }

    vec3 normal = normalize(vTransformedNormal);
    vec3 lightDirection = normalize(uLightPosition - vPosition.xyz);
    vec3 eyeDirection = normalize(uCameraPosition - vPosition.xyz);

    float directionalLightWeighting = max(dot(normal, lightDirection), 0.0);
    vec3 light = vec3(1.0, 1.0, 1.0) * directionalLightWeighting;

    vec3 reflectionDirection = reflect(-lightDirection, normal);
    float specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), 32.0);

    vec3 specular = specularLightWeighting * vec3(0.7);

    vec3 finalColor = shadow * (specular + (light * color));
    gl_FragColor = vec4(finalColor, 1.0);
  }
