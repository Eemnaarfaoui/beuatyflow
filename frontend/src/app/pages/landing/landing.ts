import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { StyleClassModule } from 'primeng/styleclass';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { TopbarWidget } from './components/topbarwidget.component';
import { HeroWidget } from './components/herowidget';
import { FeaturesWidget } from './components/featureswidget';
import { HighlightsWidget } from './components/highlightswidget';
import { PricingWidget } from './components/pricingwidget';
import { FooterWidget } from './components/footerwidget';
import { FormularyComponent } from './components/formulary/formulary.component';
import { ChatbootComponent } from "../chatboot/component/chatboot/chatboot.component";


@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidget, FeaturesWidget, HighlightsWidget,  FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule, FormularyComponent, ChatbootComponent],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <topbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <hero-widget />
                <features-widget />
                <highlights-widget />
                
                <div id ="form" class="newsletter-section text-center py-10 px-6 md:px-12 lg:px-32 dark:bg-gray-900" style="background: linear-gradient(0deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.2)), radial-gradient(77.36% 256.97% at 77.36% 57.52%, rgb(175, 231, 239) 0%, rgb(195, 227, 250) 100%); clip-path: ellipse(150% 87% at 93% 13%)">
                    <h2 class="text-2xl md:text-3xl font-semibold  dark:text-white mb-4" style="color:rgb(11, 49, 110);">
                        Subscribe to our beauty newsletter
                    </h2>
                    <p class="text-sm md:text-base dark:text-gray-300 mb-6" style="color:rgb(11, 49, 110);">
                        Stay updated with skincare tips, exclusive product recommendations, and more.
                    </p>
                    <div class="max-w-3xl mx-auto">
                        <app-formulary></app-formulary>
                    </div>
                </div>
                <app-chatboot></app-chatboot>
                <footer-widget />
            </div>
        </div>
    `
})
export class Landing {}
