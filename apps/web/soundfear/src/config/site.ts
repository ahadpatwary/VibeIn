export const siteConfig = {
   name: 'SoundFear',
   description: 'Where sound meets the mind.',
   auth: {
      /** Where to send people after a successful login / registration. */
      defaultRedirect: '/dashboard',
      /**
       * Picture shown on the right half of the auth screen (laptop and up).
       * Put your image in /public (e.g. /public/images/auth-hero.jpg) and set
       * the path here: '/images/auth-hero.jpg'.
       * While this is `null`, a designed waveform panel is rendered instead.
       */
      heroImage: null as string | null,
      heroAlt: '',
      heroHeadline: 'Where sound meets the mind.',
      heroSubline: 'Sign in to pick up right where you left off.',
   },
} as const;
