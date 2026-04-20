package crypto

import (
	"crypto/ecdsa"
	"crypto/elliptic"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
)

type KeyPair struct {
	PrivateKey *ecdsa.PrivateKey
	PublicKey  *ecdsa.PublicKey
}

func GenerateKeyPair() (*KeyPair, error) {
	privateKey, err := ecdsa.GenerateKey(elliptic.P256(), rand.Reader)
	if err != nil {
		return nil, err
	}

	return &KeyPair{
		PrivateKey: privateKey,
		PublicKey:  &privateKey.PublicKey,
	}, nil
}

func (kp *KeyPair) GetAddress() string {
	publicKeyBytes := elliptic.Marshal(kp.PublicKey.Curve, kp.PublicKey.X, kp.PublicKey.Y)
	hash := sha256.Sum256(publicKeyBytes)
	return hex.EncodeToString(hash[:])
}
