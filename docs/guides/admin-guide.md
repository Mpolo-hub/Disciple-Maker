# Guide administrateur

## Accès
- Les administrateurs et responsables HSE disposent d'un compte avec le rôle `admin`.
- L'authentification MFA est obligatoire.
- Les opérations critiques nécessitent une approbation justifiée (workflow intégré).

## Dashboard santé
- Accédez à **Tableaux de bord** pour visualiser les indicateurs anonymisés.
- Filtres par département, site, période.
- Les données sensibles sont agrégées et respectent k-anonymity.

## Gestion des droits
- Dans **Administration > Rôles**, affectez les permissions (RBAC/ABAC).
- Exportez les rapports de droits pour conformité RGPD/HIPAA.
- Utilisez l'intégration SCIM pour la synchronisation automatique avec l'annuaire d'entreprise.

## Gestion des incidents
- Les alertes d'urgence apparaissent dans **Incidents**.
- Possibilité d'accuser réception, d'ajouter un commentaire et de clore l'incident.
- Les actions sont historisées dans le journal d'audit.

## Reporting conformité
- Générez des rapports RGPD (registre des traitements, demandes d'accès) en PDF/CSV.
- Export HL7/FHIR disponible pour échange avec partenaires hospitaliers.

## Journal d'audit
- Accédez au journal complet (filtrable par utilisateur, ressource, date).
- Téléchargez les traces pour intégration SIEM.

## Maintenance
- Surveillez l'état des microservices (statut, latence, erreurs) via le dashboard Ops.
- Planifiez les fenêtres de maintenance et communiquez via notifications internes.

## Sauvegardes
- Vérifiez quotidiennement les rapports de sauvegarde.
- Lancez un test de restauration depuis l'interface au moins une fois par trimestre.

