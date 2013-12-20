precision mediump float;
varying vec2 textureCoordinate;
void main()
{
	gl_FragColor = vec4(textureCoordinate, 0.0, 1.0);
}