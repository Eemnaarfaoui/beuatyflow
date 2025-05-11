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


@Component({
    selector: 'app-landing',
    standalone: true,
    imports: [RouterModule, TopbarWidget, HeroWidget, FeaturesWidget, HighlightsWidget, PricingWidget, FooterWidget, RippleModule, StyleClassModule, ButtonModule, DividerModule, FormularyComponent],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900">
            <div id="home" class="landing-wrapper overflow-hidden">
                <topbar-widget class="py-6 px-6 mx-0 md:mx-12 lg:mx-20 lg:px-20 flex items-center justify-between relative lg:static" />
                <hero-widget />
                <features-widget />
                <highlights-widget />
                <pricing-widget />
                <div class="newsletter-section text-center py-10 px-6 md:px-12 lg:px-32 bg-primary-50 dark:bg-gray-900">
                    <h2 class="text-2xl md:text-3xl font-semibold text-primary-900 dark:text-white mb-4">
                        Subscribe to our beauty newsletter
                    </h2>
                    <p class="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-6">
                        Stay updated with skincare tips, exclusive product recommendations, and more.
                    </p>
                    <div class="max-w-3xl mx-auto">
                        <app-formulary></app-formulary>
                    </div>
                </div>
                <footer-widget />
            </div>
        </div>
    `
})
export class Landing {}
