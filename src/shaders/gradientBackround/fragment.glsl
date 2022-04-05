uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

//Noise
float mod289(float x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);}

float noise(vec3 p){
    vec3 a=floor(p);
    vec3 d=p-a;
    d=d*d*(3.-2.*d);
    
    vec4 b=a.xxyy+vec4(0.,1.,0.,1.);
    vec4 k1=perm(b.xyxy);
    vec4 k2=perm(k1.xyxy+b.zzww);
    
    vec4 c=k2+a.zzzz;
    vec4 k3=perm(c);
    vec4 k4=perm(c+1.);
    
    vec4 o1=fract(k3*(1./41.));
    vec4 o2=fract(k4*(1./41.));
    
    vec4 o3=o2*d.z+o1*(1.-d.z);
    vec2 o4=o3.yw*d.x+o3.xz*(1.-d.x);
    
    return o4.y*d.y+o4.x*(1.-d.y);
}

mat2 rotate2D(float angle){
    return mat2(
        cos(angle),-sin(angle),
        sin(angle),cos(angle)
    );
}

float lines(vec2 uv,float offset){
    return smoothstep(0.,
        .5+offset*.5,
        abs(.5*(sin(uv.x*10.)+offset*2.))
    );
}

void main()
{
    vec3 baseFirst=vec3(120./255.,158./255.,113./255.);
    vec3 accent=vec3(0.,0.,0.);
    vec3 baseSecond=vec3(224./255.,148./255.,66./255.);
    // vec3 baseThird=vec3(232./255.,201./255.,73./255.);
    
    float n=noise(vPosition+uTime/2.);
    vec2 baseUv=rotate2D(n*1.1)*vPosition.xy*.35;
    float basePattern=lines(baseUv,.5);
    float basePattern2=lines(baseUv,.1);
    
    vec3 baseColor=mix(baseFirst,baseSecond,basePattern);
    vec3 baseColor2=mix(baseColor,accent,basePattern2);
    
    gl_FragColor=vec4(vec3(baseColor2),1.);
}