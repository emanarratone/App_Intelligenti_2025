export function counterPage() {
    return `<!-- Contatore dei prodotti e paginazione -->
   
        <div class="pagination-controls d-flex justify-content-center mt-4">
            <button id="prev-page" class="btn btn-outline-secondary me-2" disabled>Precedente</button>
            <span id="page-info">Pagina 1</span>
            <button id="next-page" class="btn btn-outline-secondary ms-2">Successiva</button>
        </div>
        
`
}