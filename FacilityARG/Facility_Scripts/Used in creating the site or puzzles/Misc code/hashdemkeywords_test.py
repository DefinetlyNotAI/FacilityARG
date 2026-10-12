import hashlib
import os
import base64

def hash_with_salt(password: str, salt: bytes = None) -> tuple[str, str]:
    """
    Hash a password using SHA-512 with a salt.

    Returns:
        - base64-encoded salt
        - hex digest of SHA-512 hash
    """
    if salt is None:
        salt = os.urandom(16)  # 128-bit salt

    password_bytes = password.encode('utf-8')
    hash_obj = hashlib.sha512(salt + password_bytes)
    hashed_password = hash_obj.hexdigest()
    encoded_salt = base64.b64encode(salt).decode('utf-8')

    return encoded_salt, hashed_password

def verify_password(password: str, stored_salt: str, stored_hash: str) -> bool:
    """
    Verifies a password against the stored salt and hash.
    """
    salt = base64.b64decode(stored_salt)
    password_bytes = password.encode('utf-8')
    hash_obj = hashlib.sha512(salt + password_bytes)
    return hash_obj.hexdigest() == stored_hash

# Example Usage
if __name__ == "__main__":
    original_password = "MySecurePassword123!"

    # Hash the password
    salt, hashed = hash_with_salt(original_password)
    print("Salt:", salt)
    print("Hash:", hashed)

    # Verify the password
    input_password = "MySecurePassword123!"
    is_valid = verify_password(input_password, salt, hashed)
    print("Password is valid:", is_valid)
