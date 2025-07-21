export function createMenuTemplate() {
    return`
    <div id="menu-container-grande" style="background: bisque">
        <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid" style="background: beige">
                <a class="navbar-brand" >Menù</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav">
                        <li class="nav-item">
                            <a class="nav-link active" aria-current="page" href="/Home"  id="link-Home">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" aria-current="page" href="#" style="color: black" id="link-ordini">Ordini</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" aria-current="page" href="#lista-desideri" style="color: black">Lista Desideri</a>
                        </li>
                       <div class="dropdown" id="div-genere">
                            <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="background-color: transparent;">
                                <span id="span-genere">Genere</span>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" data-filter="genere" data-value="Uomo">Uomo</a></li>
                                <li><a class="dropdown-item" href="#" data-filter="genere" data-value="Donna">Donna</a></li>
                                <li><a class="dropdown-item" href="#" data-filter="genere" data-value="Bambini">Bambini</a></li>
                                <li><a class="dropdown-item" href="#" data-filter="genere" data-value="Unisex">Unisex</a></li>
                            </ul>
                       </div>
                    
                    <div class="dropdown" id="div-categorie">
                        <button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="background-color: transparent;">
                            <span id="span-categorie">Categoria</span>
                        </button>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="#" data-filter="categoria" data-value="Scarpe">Scarpe</a></li>
                            <li><a class="dropdown-item" href="#" data-filter="categoria" data-value="Felpe">Felpe</a></li>
                            <li><a class="dropdown-item" href="#" data-filter="categoria" data-value="Accessori">Accessori</a></li>
                            <li><a class="dropdown-item" href="#" data-filter="categoria" data-value="Pantaloni">Pantaloni</a></li>
                            <li><a class="dropdown-item" href="#" data-filter="categoria" data-value="Magliette">Magliette</a></li>
                            <li><a class="dropdown-item" href="#" data-filter="categoria" data-value="Camice">Camice</a></li>
                        </ul>
                    </div>

                    </ul>
                </div>
                <form class="d-flex my-2 mx-auto" role="search" id="search-form">
                    <input class="form-control d-none d-sm-block" id="search-field" type="search" placeholder="Cerca" aria-label="Cerca" list="suggestions">
                    <datalist id="suggestions"></datalist>
                    <button class="btn  d-none d-sm-block ms-1" type="submit" id="search-button">
                       <img src="../../.././images/svg/lente.svg" > 
                    </button>
                </form>
                </div>
        </nav>
    </div>
   `
}