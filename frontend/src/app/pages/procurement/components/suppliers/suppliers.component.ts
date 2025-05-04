import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { CommonModule } from '@angular/common';

Chart.register(...registerables); // Nécessaire pour Chart.js

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {
  supplierReliabilityData$: any[] = [];
  barChartLabels: string[] = [];
  barChartValues: number[] = [];
  chartInstance: Chart | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getReliabilityData();
    this.getReliabilityChartData();
  }

  getReliabilityData(): void {
    this.http.get<any[]>('http://127.0.0.1:5000/ml/reliability').subscribe(data => {
      console.log('Données reçues pour le tableau : ', data);
      this.supplierReliabilityData$ = data;
    });
  }
  getReliabilityChartData(): void {
    this.http.get<any>('http://127.0.0.1:5000/ml/supplierReliabilityChart').subscribe({
      next: (response) => {
        this.barChartLabels = response.labels;
        this.barChartValues = response.data;
        this.createChart();  // ⚠️ Important d’appeler ici, après avoir reçu les données
      },
      error: (err) => {
        console.error('Erreur lors du chargement des données du graphique', err);
      }
    });
  }
  

  createChart(): void {
    const canvas = document.getElementById('supplierReliabilityChart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.barChartLabels,
        datasets: [{
          label: 'Nombre de fournisseurs',
          data: this.barChartValues,
          backgroundColor: ['#FFEB3B', '#4CAF50', '#F44336']
        }]
      },
      options: {
        responsive: true, // Permet au graphique de s'adapter à la taille de son conteneur
        maintainAspectRatio: false, // Empêche le maintien du ratio largeur/hauteur par défaut
        layout: {
          padding: {
            left: 20,
            right: 20,
            top: 20,
            bottom: 20
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Nombre de fournisseurs' // Titre de l'axe Y
            }
          },
          x: {
            title: {
              display: true,
              text: 'Catégorie de fiabilité' // Titre de l'axe X
            }
          }
        },
        plugins: {
          legend: {
            position: 'bottom' // Position de la légende
          },
          title: {
            display: true,
            text: 'Répartition des fournisseurs par fiabilité', // Titre du graphique
            font: {
              size: 16
            }
          }
        }
      }
    });
  }}