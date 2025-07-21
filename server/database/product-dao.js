"use strict"
const db = require('./db.js')


exports.getVestiti = function (){
    return new Promise((resolve, reject) => {
        const sql = "SELECT * from vestiti"
        db.all(sql, (err, rows) => {
            if (err){
                reject({status: 500, msg: err.message})
            }else {
                if (rows.length){

                }else {
                    reject({status: 404, msg: "Nessun vesito nel db"});
                }
            }
        })
    })
}

const ProductDAO = {
    getAllProducts: (callback) => {
        const query = 'SELECT nome_prodotto AS name, id_prodotto AS id, prezzo AS price, immagine AS image, genere AS genere FROM vestiti';
        db.all(query,[], (err, rows) => {
            if (err) {
                console.error("Errore nella query del database:", err);  // Log dell'errore SQL
                return callback(err, null);
            }
            callback(null, rows);
        });
    },

    /**
     * funzione per ottenere i prodotti in base al genere
     * @param genere
     * @param callback risoluzione query
     */
    getProductsByGenere: (genere, callback) => {
        const query =
            'SELECT nome_prodotto AS name, id_prodotto AS id, prezzo AS price, immagine AS image, genere AS genere FROM vestiti WHERE genere = ?';
        db.all(query, [genere], (err, rows) => {
            if (err) {
                console.error("Errore nella query del database:", err);  // Log dell'errore SQL
                return callback(err, null);
            }
            callback(null, rows);
        });
    },

    /**
     * funzione per ottenere i prodotti in base alla categoria
     * @param categoria
     * @param callback
     */
    getProductsByCategory: (categoria, callback) => {
        const query =
            'SELECT nome_prodotto AS name, id_prodotto AS id, prezzo AS price, immagine AS image, genere AS genere, categoria AS categoria FROM vestiti WHERE categoria = ?';
        db.all(query, [categoria], (err, rows) => {
            if (err) {
                console.error("Errore nella query del database:", err);  // Log dell'errore SQL
                return callback(err, null);
            }
            callback(null, rows);
        });
    },

    /**
     * ottenere il prodotto con lo specifico id
     * @param id
     * @param callback
     */
    getProductsById: (id, callback) => {
        const query =
            'SELECT nome_prodotto AS name, id_prodotto AS id, prezzo AS price, immagine AS image, genere AS genere, categoria AS categoria FROM vestiti WHERE id = ?';
        db.get(query, [id], (err, row) => {
            if (err) {
                console.error("Errore nella query del database:", err);
                return callback(err, null);
            }
            callback(null, row);
        });
    },


    insertProduct: (product, callback) => {
        const query = `INSERT INTO vestiti (nome_prodotto, prezzo, tipo, immagine) VALUES (?, ?, ?, ?)`;
        db.run(query, [product.name, product.price, product.tipo, product.image],
            function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, { id: this.lastID });
        });
    }
};

module.exports = ProductDAO;


