export interface Template {
  id: string;
  name: string;
  description: string;
  url: string; // The Unsplash image URL
}

export const TEMPLATES: Template[] = [
  {
    id: 'laptop_mockup',
    name: 'Laptop Screen Mockup',
    description: 'A professional laptop display overlay mockup for showcasing designs.',
    url: 'https://images.unsplash.com/photo-1496181130204-7552cc1524e2?w=800'
  },
  {
    id: 'desktop_mockup',
    name: 'Modern Desktop Display',
    description: 'Clean Apple iMac or studio monitor mockup with ambient studio lighting.',
    url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800'
  },
  {
    id: 'mobile_mockup',
    name: 'Smartphone Device Mockup',
    description: 'Sleek dark phone mockup container for app UI/UX wireframes.',
    url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'
  },
  {
    id: 'dark_blueprint',
    name: 'Cyber Grid Blueprint',
    description: 'Futuristic technical drawing layout blueprint background.',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800'
  },
  {
    id: 'neon_cityscape',
    name: 'Retro Neon Lights',
    description: 'Abstract cyberpunk vaporwave cityscape background.',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800'
  }
];
