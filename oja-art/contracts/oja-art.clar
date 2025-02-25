;; OjaArt - Decentralized Pixel Art Marketplace
;; Author: Bolt
;; License: MIT

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-already-listed (err u102))
(define-constant err-not-listed (err u103))
(define-constant err-price-zero (err u104))
(define-constant err-insufficient-balance (err u105))
(define-constant err-not-owner (err u106))
(define-constant err-invalid-input (err u107))

;; Data Variables
(define-data-var platform-fee uint u25) ;; 2.5% fee
(define-data-var total-arts uint u0)

;; Data Maps
(define-map pixel-arts { art-id: uint } {
    creator: principal,
    owner: principal,
    ipfs-hash: (string-ascii 64),
    name: (string-ascii 64),
    description: (string-ascii 256),
    created-at: uint,
    is-listed: bool,
    price: uint
})

(define-map artist-stats principal {
    arts-created: uint,
    arts-sold: uint,
    total-earnings: uint
})

;; Private Functions
(define-private (validate-string (input (string-ascii 64)))
    (> (len input) u0))

(define-private (validate-description (input (string-ascii 256)))
    (> (len input) u0))

(define-private (transfer-stx (amount uint) (sender principal) (recipient principal))
    (let
        (
            (fee (/ (* amount (var-get platform-fee)) u1000))
            (payment (- amount fee))
        )
        (try! (stx-transfer? fee sender contract-owner))
        (try! (stx-transfer? payment sender recipient))
        (ok true)
    )
)

(define-private (update-artist-stats (artist principal) (sold bool) (amount uint))
    (let
        (
            (current-stats (default-to
                { arts-created: u0, arts-sold: u0, total-earnings: u0 }
                (map-get? artist-stats artist)))
        )
        (map-set artist-stats artist
            (merge current-stats {
                arts-sold: (if sold
                    (+ (get arts-sold current-stats) u1)
                    (get arts-sold current-stats)),
                total-earnings: (if sold
                    (+ (get total-earnings current-stats) amount)
                    (get total-earnings current-stats))
            })
        )
    )
)

;; Public Functions
(define-public (create-pixel-art (ipfs-hash (string-ascii 64)) (name (string-ascii 64)) (description (string-ascii 256)))
    (begin
        (asserts! (validate-string ipfs-hash) err-invalid-input)
        (asserts! (validate-string name) err-invalid-input)
        (asserts! (validate-description description) err-invalid-input)
        
        (let
            (
                (art-id (+ (var-get total-arts) u1))
                (artist-data (default-to
                    { arts-created: u0, arts-sold: u0, total-earnings: u0 }
                    (map-get? artist-stats tx-sender)))
            )
            (map-set pixel-arts { art-id: art-id }
                {
                    creator: tx-sender,
                    owner: tx-sender,
                    ipfs-hash: ipfs-hash,
                    name: name,
                    description: description,
                    created-at: block-height,
                    is-listed: false,
                    price: u0
                }
            )
            (map-set artist-stats tx-sender
                (merge artist-data {
                    arts-created: (+ (get arts-created artist-data) u1)
                })
            )
            (var-set total-arts art-id)
            (ok art-id)
        )
    )
)

(define-public (list-pixel-art (art-id uint) (price uint))
    (begin
        (asserts! (> art-id u0) err-invalid-input)
        (let
            (
                (art (unwrap! (map-get? pixel-arts { art-id: art-id }) err-not-found))
            )
            (asserts! (is-eq (get owner art) tx-sender) err-not-owner)
            (asserts! (> price u0) err-price-zero)
            (asserts! (not (get is-listed art)) err-already-listed)
            
            (map-set pixel-arts { art-id: art-id }
                (merge art {
                    is-listed: true,
                    price: price
                })
            )
            (ok true)
        )
    )
)

(define-public (unlist-pixel-art (art-id uint))
    (begin
        (asserts! (> art-id u0) err-invalid-input)
        (let
            (
                (art (unwrap! (map-get? pixel-arts { art-id: art-id }) err-not-found))
            )
            (asserts! (is-eq (get owner art) tx-sender) err-not-owner)
            (asserts! (get is-listed art) err-not-listed)
            
            (map-set pixel-arts { art-id: art-id }
                (merge art {
                    is-listed: false,
                    price: u0
                })
            )
            (ok true)
        )
    )
)

(define-public (buy-pixel-art (art-id uint))
    (begin
        (asserts! (> art-id u0) err-invalid-input)
        (let
            (
                (art (unwrap! (map-get? pixel-arts { art-id: art-id }) err-not-found))
                (price (get price art))
                (seller (get owner art))
            )
            (asserts! (get is-listed art) err-not-listed)
            (asserts! (is-eq (> price u0) true) err-price-zero)
            
            (try! (transfer-stx price tx-sender seller))
            (update-artist-stats seller true price)
            
            (map-set pixel-arts { art-id: art-id }
                (merge art {
                    owner: tx-sender,
                    is-listed: false,
                    price: u0
                })
            )
            (ok true)
        )
    )
)

;; Read-Only Functions
(define-read-only (get-pixel-art (art-id uint))
    (ok (unwrap! (map-get? pixel-arts { art-id: art-id }) err-not-found))
)

(define-read-only (get-artist-stats (artist principal))
    (ok (default-to
        { arts-created: u0, arts-sold: u0, total-earnings: u0 }
        (map-get? artist-stats artist)
    ))
)

(define-read-only (get-platform-fee)
    (ok (var-get platform-fee))
)

;; Admin Functions
(define-public (set-platform-fee (new-fee uint))
    (begin
        (asserts! (is-eq tx-sender contract-owner) err-owner-only)
        (asserts! (<= new-fee u1000) err-invalid-input)
        (var-set platform-fee new-fee)
        (ok true)
    )
)