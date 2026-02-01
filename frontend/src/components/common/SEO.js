import React, { useEffect } from 'react';
import useSettingsStore from '../../store/settingsStore';

const SEO = ({ title, description, keywords, image }) => {
  const { settings } = useSettingsStore();

  useEffect(() => {
    // Update page title
    const pageTitle = title 
      ? `${title} | ${settings?.site_name || 'Keyhost Homes'}`
      : settings?.seo_meta_title || settings?.site_name || 'Keyhost Homes';
    
    document.title = pageTitle;

    // Update meta description
    const metaDescription = description || settings?.seo_meta_description || settings?.site_description || '';
    let descriptionTag = document.querySelector('meta[name="description"]');
    if (!descriptionTag) {
      descriptionTag = document.createElement('meta');
      descriptionTag.name = 'description';
      document.head.appendChild(descriptionTag);
    }
    descriptionTag.content = metaDescription;

    // Update meta keywords
    const metaKeywords = keywords || settings?.seo_keywords || '';
    if (metaKeywords) {
      let keywordsTag = document.querySelector('meta[name="keywords"]');
      if (!keywordsTag) {
        keywordsTag = document.createElement('meta');
        keywordsTag.name = 'keywords';
        document.head.appendChild(keywordsTag);
      }
      keywordsTag.content = metaKeywords;
    }

    // Update Open Graph tags
    const ogImage = image || settings?.seo_og_image || '';
    if (ogImage) {
      let ogImageTag = document.querySelector('meta[property="og:image"]');
      if (!ogImageTag) {
        ogImageTag = document.createElement('meta');
        ogImageTag.setAttribute('property', 'og:image');
        document.head.appendChild(ogImageTag);
      }
      ogImageTag.content = ogImage;
    }

    // Update OG Title
    let ogTitleTag = document.querySelector('meta[property="og:title"]');
    if (!ogTitleTag) {
      ogTitleTag = document.createElement('meta');
      ogTitleTag.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitleTag);
    }
    ogTitleTag.content = pageTitle;

    // Update OG Description
    let ogDescTag = document.querySelector('meta[property="og:description"]');
    if (!ogDescTag) {
      ogDescTag = document.createElement('meta');
      ogDescTag.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescTag);
    }
    ogDescTag.content = metaDescription;

    // Update Favicon dynamically from database
    if (settings?.site_favicon) {
      let faviconLink = document.querySelector('link[rel="icon"]');
      if (!faviconLink) {
        faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        document.head.appendChild(faviconLink);
      }
      faviconLink.href = settings.site_favicon;
      console.log('✅ Favicon updated from database');
    }

    // Add Google Analytics
    if (settings?.google_analytics_id && !document.querySelector(`script[src*="${settings.google_analytics_id}"]`)) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${settings.google_analytics_id}`;
      document.head.appendChild(gaScript);

      const gaInitScript = document.createElement('script');
      gaInitScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${settings.google_analytics_id}');
      `;
      document.head.appendChild(gaInitScript);
    }

    // Add Google Tag Manager
    if (settings?.google_tag_manager_id && !document.querySelector(`script[src*="${settings.google_tag_manager_id}"]`)) {
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${settings.google_tag_manager_id}');
      `;
      document.head.appendChild(gtmScript);
    }

    // Add Facebook Pixel
    if (settings?.facebook_pixel_id && !document.querySelector(`script[src*="connect.facebook.net"]`)) {
      const fbScript = document.createElement('script');
      fbScript.innerHTML = `
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${settings.facebook_pixel_id}');
        fbq('track', 'PageView');
      `;
      document.head.appendChild(fbScript);
    }

    // Add custom header scripts
    if (settings?.custom_header_scripts && !document.querySelector('#custom-header-scripts')) {
      const customHeaderDiv = document.createElement('div');
      customHeaderDiv.id = 'custom-header-scripts';
      customHeaderDiv.innerHTML = settings.custom_header_scripts;
      document.head.appendChild(customHeaderDiv);
    }

    // Add custom footer scripts
    if (settings?.custom_footer_scripts && !document.querySelector('#custom-footer-scripts')) {
      const customFooterDiv = document.createElement('div');
      customFooterDiv.id = 'custom-footer-scripts';
      customFooterDiv.innerHTML = settings.custom_footer_scripts;
      document.body.appendChild(customFooterDiv);
    }

  }, [settings, title, description, keywords, image]);

  return null; // This component doesn't render anything
};

export default SEO;

