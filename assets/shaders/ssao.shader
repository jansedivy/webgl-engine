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

  uniform vec2 uViewportSize;

  uniform sampler2D uSampler;
  uniform sampler2D uDepth;

  varying vec2 vTextureCoord;

  #define DL 2.399963229728653
  #define EULER 2.718281828459045

  const int samples = 32;
  const float radius = 5.0;

  const float noiseAmount = 0.0003;

  const float diffArea = 0.4;
  const float gDisplace = 0.4;

  const float width = 512.0;
  const float height = 512.0;

  vec2 rand( const vec2 coord ) {
    vec2 noise;

    float ff = fract( 1.0 - coord.s * ( width / 2.0 ) );
    float gg = fract( coord.t * ( height / 2.0 ) );

    noise = vec2( 0.25, 0.75 ) * vec2( ff ) + vec2( 0.75, 0.25 ) * gg;

    return ( noise * 2.0  - 1.0 ) * noiseAmount;
  }

  float unpack(vec4 colour) {
      const vec4 bitShifts = vec4(1.0,
          1.0 / 255.0,
          1.0 / (255.0 * 255.0),
          1.0 / (255.0 * 255.0 * 255.0));
    return dot(colour, bitShifts);
  }

  float readDepth( const in vec2 coord ) {
    float cameraNear = 0.01;
    float cameraFar = 1000.0;
    return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpack( texture2D( uDepth, coord ) ) * ( cameraFar - cameraNear ) );
  }

  float compareDepths( const in float depth1, const in float depth2, inout int far ) {
    float garea = 2.0;
    float diff = ( depth1 - depth2 ) * 100.0;

    // reduce left bell width to avoid self-shadowing

    if ( diff < gDisplace ) {
      garea = diffArea;
    } else {
      far = 1;
    }

    float dd = diff - gDisplace;
    float gauss = pow( EULER, -2.0 * dd * dd / ( garea * garea ) );
    return gauss;
  }

  float calcAO( float depth, float dw, float dh ) {
    float dd = radius - depth * radius;
    vec2 vv = vec2( dw, dh );

    vec2 coord1 = vTextureCoord + dd * vv;
    vec2 coord2 = vTextureCoord - dd * vv;

    float temp1 = 0.0;
    float temp2 = 0.0;

    int far = 0;
    temp1 = compareDepths( depth, readDepth( coord1 ), far );

    // DEPTH EXTRAPOLATION

    if ( far > 0 ) {
      temp2 = compareDepths( readDepth( coord2 ), depth, far );
      temp1 += ( 1.0 - temp1 ) * temp2;
    }

    return temp1;
  }


  const vec3 onlyAOColor = vec3( 1.0, 0.7, 0.5 );

  void main(void) {
    // test
    float aoClamp = 0.3;
    float lumInfluence = 0.6;

    // test
    vec2 noise = rand(vTextureCoord);
    float depth = readDepth(vTextureCoord);
    float tt = clamp(depth, aoClamp, 1.0 );

    float w = ( 1.0 / width )  / tt + ( noise.x * ( 1.0 - noise.x ) );
    float h = ( 1.0 / height ) / tt + ( noise.y * ( 1.0 - noise.y ) );

    float pw;
    float ph;

    float ao;

    float dz = 1.0 / float( samples );
    float z = 1.0 - dz / 2.0;
    float l = 0.0;

    for ( int i = 0; i <= samples; i ++ ) {
      float r = sqrt( 1.0 - z );

      pw = cos( l ) * r;
      ph = sin( l ) * r;
      ao += calcAO( depth, pw * w, ph * h );
      z = z - dz;
      l = l + DL;
    }

    ao /= float( samples );
    ao = 1.0 - ao;

    vec3 color = texture2D(uSampler, vTextureCoord).rgb;

    vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );
    float lum = dot( color.rgb, lumcoeff );
    vec3 luminance = vec3( lum );

    vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance * lumInfluence ) );

    gl_FragColor = vec4( final, 1.0 );
  }

