;; OjaArt Trait Definition
(define-trait oja-art-trait
    (
        ;; Create a new pixel art
        (create-pixel-art ((string-ascii 64) (string-ascii 64) (string-ascii 256)) (response uint uint))
        
        ;; List pixel art for sale
        (list-pixel-art (uint uint) (response bool uint))
        
        ;; Unlist pixel art from sale
        (unlist-pixel-art (uint) (response bool uint))
        
        ;; Buy pixel art
        (buy-pixel-art (uint) (response bool uint))
        
        ;; Get pixel art details
        (get-pixel-art (uint) (response {
            creator: principal,
            owner: principal,
            ipfs-hash: (string-ascii 64),
            name: (string-ascii 64),
            description: (string-ascii 256),
            created-at: uint,
            is-listed: bool,
            price: uint
        } uint))
    )
)