import { SeoHead } from '../components/SeoHead';
import { HeroSlide, VideoHero } from '../components/home/VideoHero';
import { ShopTheLook } from '../components/home/ShopTheLook';
import {
  BeachStoriesSection,
  BenefitsBar,
  BestSellersCarousel,
  BrandStorySection,
  CategoriesSection,
  EditorialVideoSection,
  InstagramGrid,
  NewCollectionSection,
  NewsletterSection,
} from '../components/home/HomeSections';
import { MEDIA_ASSETS } from '../data/catalog';

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'golden-hour',
    label: '01 · Golden Hour',
    desktop: MEDIA_ASSETS.heroDesktop,
    mobile: MEDIA_ASSETS.heroMobile,
    caption: 'Costa Sur Peruana · Envíos a todo el Perú',
    alt: 'Pareja caminando por la playa peruana al atardecer con polos BEACH POLO',
  },
  {
    id: 'turquesa-pacific',
    label: '02 · Orilla del Pacífico',
    desktop: MEDIA_ASSETS.heroSlideFour,
    mobile: MEDIA_ASSETS.heroSlideFour,
    caption: 'Olas del Pacífico · Algodón Pima 220g',
    alt: 'Modelo caminando descalzo hacia olas turquesas en playa peruana',
  },
  {
    id: 'marea-alta',
    label: '03 · Marea Alta',
    desktop: MEDIA_ASSETS.editorialStory,
    mobile: MEDIA_ASSETS.catMujer,
    caption: 'Colección Summer 2027 · Cortes Relajados',
    alt: 'Modelos en playa peruana al anochecer con prendas beachwear arena y lino',
  },
  {
    id: 'costa-norte',
    label: '04 · Costa Norte',
    desktop: MEDIA_ASSETS.shopTheLook,
    mobile: MEDIA_ASSETS.heroMobile,
    caption: 'Océano · Libertad · Verano',
    alt: 'Lookbook costero frente al mar con polo azul océano y shorts arena',
  },
];

export function HomePage() {
  return (
    <>
      <SeoHead
        title="BEACH POLO – Vive la Playa | Moda Beachwear Premium Perú"
        description="Moda beachwear premium inspirada en el océano y el verano peruano. Polos de algodón Pima, shorts y accesorios con envíos a todo el Perú."
        canonicalPath="/"
        ogImage={MEDIA_ASSETS.heroDesktop}
      />
      <VideoHero slides={HERO_SLIDES} />
      <BenefitsBar />
      <NewCollectionSection />
      <BestSellersCarousel />
      <EditorialVideoSection />
      <ShopTheLook />
      <CategoriesSection />
      <BrandStorySection />
      <BeachStoriesSection />
      <InstagramGrid />
      <NewsletterSection />
    </>
  );
}
